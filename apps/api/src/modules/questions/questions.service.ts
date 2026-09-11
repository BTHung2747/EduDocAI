import { Injectable, NotFoundException } from '@nestjs/common';
import type { CreateQuestionInput, QuestionListQuery, UpdateQuestionInput } from '@edudocs/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';

const include = { options: { orderBy: { orderIndex: 'asc' as const } }, citations: true };

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService, private readonly subjects: SubjectsService) {}

  async list(ownerId: string, query: QuestionListQuery) {
    const where = {
      ownerId,
      deletedAt: null,
      ...(query.subjectId ? { subjectId: query.subjectId } : {}),
      ...(query.difficulty ? { difficulty: query.difficulty } : {}),
      ...(query.sourceType ? { sourceType: query.sourceType } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.q ? { text: { contains: query.q, mode: 'insensitive' as const } } : {}),
    };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.question.count({ where }),
      this.prisma.question.findMany({ where, include, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (query.page - 1) * query.limit, take: query.limit }),
    ]);
    return { items: items.map(toResponse), meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
  }

  async get(ownerId: string, id: string) { return toResponse(await this.requireOwned(ownerId, id)); }

  async create(ownerId: string, input: CreateQuestionInput) {
    if (input.subjectId) await this.subjects.requireOwned(ownerId, input.subjectId);
    const question = await this.prisma.question.create({
      data: { ...questionData(input), ownerId, sourceType: 'MANUAL', status: 'DRAFT' }, include,
    });
    return toResponse(question);
  }

  async update(ownerId: string, id: string, input: UpdateQuestionInput) {
    const question = await this.requireOwned(ownerId, id);
    if (input.subjectId) await this.subjects.requireOwned(ownerId, input.subjectId);
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.questionOption.deleteMany({ where: { questionId: question.id } });
      return tx.question.update({
        where: { id: question.id },
        data: { ...questionData(input), options: { create: optionData(input.options) } },
        include,
      });
    });
    return toResponse(updated);
  }

  async remove(ownerId: string, id: string) {
    await this.requireOwned(ownerId, id);
    await this.prisma.question.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async approve(ownerId: string, id: string) {
    await this.requireOwned(ownerId, id);
    return toResponse(await this.prisma.question.update({ where: { id }, data: { status: 'APPROVED' }, include }));
  }

  async requireOwned(ownerId: string, id: string) {
    const question = await this.prisma.question.findFirst({ where: { id, ownerId, deletedAt: null }, include });
    if (!question) throw new NotFoundException({ code: 'QUESTION_NOT_FOUND', message: 'Không tìm thấy câu hỏi.' });
    return question;
  }
}

function optionData(options: { A: string; B: string; C: string; D: string }) {
  return (['A', 'B', 'C', 'D'] as const).map((key, orderIndex) => ({ key, orderIndex, text: options[key].trim() }));
}

function questionData(input: CreateQuestionInput | UpdateQuestionInput) {
  return {
    text: input.text.trim(), subjectId: input.subjectId ?? null, difficulty: input.difficulty,
    explanation: input.explanation.trim(), correctOptionKey: input.correctOptionKey,
    options: { create: optionData(input.options) },
  };
}

function toResponse(question: { id: string; subjectId: string | null; sourceType: string; status: string; text: string; explanation: string; difficulty: string; correctOptionKey: string; createdAt: Date; updatedAt: Date; options: Array<{ key: string; text: string }>; citations: Array<{ documentId: string; chunkId: string; pageStart: number | null; pageEnd: number | null; quote: string }> }) {
  return {
    id: question.id, subjectId: question.subjectId, sourceType: question.sourceType, status: question.status, text: question.text,
    options: Object.fromEntries(question.options.map((option) => [option.key, option.text])) as { A: string; B: string; C: string; D: string },
    correctOptionKey: question.correctOptionKey, explanation: question.explanation, difficulty: question.difficulty,
    citations: question.citations.map(({ documentId, chunkId, pageStart, pageEnd, quote }) => ({ documentId, chunkId, pageStart, pageEnd, quote })),
    createdAt: question.createdAt, updatedAt: question.updatedAt,
  };
}
