import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type { CreateTestInput, TestListQuery, TestQuestionIdsInput, UpdateTestInput } from '@edudocs/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma';

const include = { questions: { orderBy: { orderIndex: 'asc' as const } } };

@Injectable()
export class TestsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(ownerId: string, query: TestListQuery) {
    const where = { ownerId, deletedAt: null, ...(query.status ? { status: query.status } : {}), ...(query.q ? { title: { contains: query.q, mode: 'insensitive' as const } } : {}) };
    const [total, tests] = await this.prisma.$transaction([this.prisma.test.count({ where }), this.prisma.test.findMany({ where, include, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (query.page - 1) * query.limit, take: query.limit })]);
    return { items: tests.map(toResponse), meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
  }

  async get(ownerId: string, id: string) { return toResponse(await this.requireOwned(ownerId, id)); }

  async create(ownerId: string, input: CreateTestInput) {
    const test = await this.prisma.$transaction(async (tx) => {
      await this.requireApprovedQuestions(tx, ownerId, input.questionIds);
      return tx.test.create({ data: { ownerId, ...configData(input), questions: { create: input.questionIds.map((questionId, orderIndex) => ({ questionId, orderIndex, points: 1 })) } }, include });
    });
    return toResponse(test);
  }

  async update(ownerId: string, id: string, input: UpdateTestInput) {
    const test = await this.prisma.$transaction(async (tx) => {
      await this.requireDraft(tx, ownerId, id);
      return tx.test.update({ where: { id }, data: configData(input), include });
    });
    return toResponse(test);
  }

  async remove(ownerId: string, id: string) {
    await this.prisma.$transaction(async (tx) => { await this.requireDraft(tx, ownerId, id); await tx.test.update({ where: { id }, data: { deletedAt: new Date() } }); });
  }

  async addQuestions(ownerId: string, id: string, input: TestQuestionIdsInput) {
    const test = await this.prisma.$transaction(async (tx) => {
      const current = await this.requireDraft(tx, ownerId, id);
      await this.requireApprovedQuestions(tx, ownerId, input.questionIds);
      const existing = await tx.testQuestion.findMany({ where: { testId: id }, select: { questionId: true, orderIndex: true } });
      if (input.questionIds.some((questionId) => existing.some((item) => item.questionId === questionId))) throw new ConflictException({ code: 'TEST_QUESTION_EXISTS', message: 'Câu hỏi đã có trong đề.' });
      await tx.testQuestion.createMany({ data: input.questionIds.map((questionId, index) => ({ testId: id, questionId, orderIndex: existing.length + index, points: 1 })) });
      return tx.test.findUniqueOrThrow({ where: { id: current.id }, include });
    });
    return toResponse(test);
  }

  async removeQuestion(ownerId: string, id: string, questionId: string) {
    const test = await this.prisma.$transaction(async (tx) => {
      await this.requireDraft(tx, ownerId, id);
      const item = await tx.testQuestion.findFirst({ where: { testId: id, questionId } });
      if (!item) throw new NotFoundException({ code: 'TEST_QUESTION_NOT_FOUND', message: 'Không tìm thấy câu hỏi trong đề.' });
      await tx.testQuestion.delete({ where: { id: item.id } });
      const remaining = await tx.testQuestion.findMany({ where: { testId: id }, orderBy: { orderIndex: 'asc' } });
      await this.applyOrder(tx, id, remaining.map((item) => item.questionId));
      return tx.test.findUniqueOrThrow({ where: { id }, include });
    });
    return toResponse(test);
  }

  async reorderQuestions(ownerId: string, id: string, input: TestQuestionIdsInput) {
    const test = await this.prisma.$transaction(async (tx) => {
      await this.requireDraft(tx, ownerId, id);
      const current = await tx.testQuestion.findMany({ where: { testId: id }, select: { questionId: true } });
      if (current.length !== input.questionIds.length || input.questionIds.some((questionId) => !current.some((item) => item.questionId === questionId))) throw new ConflictException({ code: 'TEST_QUESTION_SET_MISMATCH', message: 'Danh sách sắp xếp không khớp đề hiện tại.' });
      await this.applyOrder(tx, id, input.questionIds);
      return tx.test.findUniqueOrThrow({ where: { id }, include });
    });
    return toResponse(test);
  }

  async publish(ownerId: string, id: string) {
    const test = await this.prisma.$transaction(async (tx) => {
      await this.requireDraft(tx, ownerId, id);
      const items = await tx.testQuestion.findMany({ where: { testId: id }, include: { question: { include: { options: { orderBy: { orderIndex: 'asc' } } } } }, orderBy: { orderIndex: 'asc' } });
      if (!items.length || items.some((item) => item.question.ownerId !== ownerId || item.question.deletedAt || item.question.status !== 'APPROVED')) throw new ConflictException({ code: 'TEST_NOT_PUBLISHABLE', message: 'Đề cần ít nhất một câu hỏi đã duyệt thuộc tài khoản của bạn.' });
      for (const item of items) {
        await tx.testQuestion.update({ where: { id: item.id }, data: { snapshotJson: { text: item.question.text, options: Object.fromEntries(item.question.options.map((option) => [option.key, option.text])), correctOptionKey: item.question.correctOptionKey, explanation: item.question.explanation, points: item.points } } });
      }
      return tx.test.update({ where: { id }, data: { status: 'PUBLISHED', publishedAt: new Date() }, include });
    });
    return toResponse(test);
  }

  private async requireOwned(ownerId: string, id: string) {
    const test = await this.prisma.test.findFirst({ where: { id, ownerId, deletedAt: null }, include });
    if (!test) throw new NotFoundException({ code: 'TEST_NOT_FOUND', message: 'Không tìm thấy đề kiểm tra.' });
    return test;
  }

  private async requireDraft(tx: Prisma.TransactionClient, ownerId: string, id: string) {
    const test = await tx.test.findFirst({ where: { id, ownerId, deletedAt: null } });
    if (!test) throw new NotFoundException({ code: 'TEST_NOT_FOUND', message: 'Không tìm thấy đề kiểm tra.' });
    if (test.status !== 'DRAFT') throw new ConflictException({ code: 'TEST_NOT_DRAFT', message: 'Chỉ có thể sửa đề ở trạng thái DRAFT.' });
    return test;
  }

  private async requireApprovedQuestions(tx: Prisma.TransactionClient, ownerId: string, questionIds: string[]) {
    if (!questionIds.length) return;
    const questions = await tx.question.findMany({ where: { id: { in: questionIds }, ownerId, deletedAt: null, status: 'APPROVED' }, select: { id: true } });
    if (questions.length !== questionIds.length) throw new ConflictException({ code: 'QUESTION_NOT_APPROVED_OR_NOT_OWNED', message: 'Chỉ dùng câu hỏi APPROVED thuộc tài khoản của bạn.' });
  }

  private async applyOrder(tx: Prisma.TransactionClient, testId: string, questionIds: string[]) {
    await tx.testQuestion.updateMany({ where: { testId }, data: { orderIndex: { increment: 1000 } } });
    for (const [orderIndex, questionId] of questionIds.entries()) await tx.testQuestion.updateMany({ where: { testId, questionId }, data: { orderIndex } });
  }
}

function configData(input: Omit<CreateTestInput, 'questionIds'> | UpdateTestInput) { return { title: input.title.trim(), description: input.description?.trim() || null, durationMinutes: input.durationMinutes ?? null, shuffleQuestions: input.shuffleQuestions, shuffleOptions: input.shuffleOptions, showAnswers: input.showAnswers }; }
function toResponse(test: { id: string; title: string; description: string | null; durationMinutes: number | null; shuffleQuestions: boolean; shuffleOptions: boolean; showAnswers: boolean; status: string; publishedAt: Date | null; createdAt: Date; updatedAt: Date; questions: Array<{ id: string; questionId: string; orderIndex: number; points: number }> }) { return { id: test.id, title: test.title, description: test.description, durationMinutes: test.durationMinutes, shuffleQuestions: test.shuffleQuestions, shuffleOptions: test.shuffleOptions, showAnswers: test.showAnswers, status: test.status, publishedAt: test.publishedAt, totalPoints: test.questions.reduce((sum, item) => sum + item.points, 0), questions: test.questions.map(({ id, questionId, orderIndex, points }) => ({ id, questionId, orderIndex, points })), createdAt: test.createdAt, updatedAt: test.updatedAt }; }
