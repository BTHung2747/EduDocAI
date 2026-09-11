import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import mammoth from 'mammoth';
import { ConfigService } from '@nestjs/config';
import { questionImportErrorSchema, questionOptionsSchema, type QuestionImportItemUpdate } from '@edudocs/contracts';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { SubjectsService } from '../subjects/subjects.service';
import { parseQuestionImport, type ParsedImportItem } from './question-import.parser';

const allowed = { txt: ['text/plain'], docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'] } as const;

@Injectable()
export class QuestionImportService {
  constructor(private readonly prisma: PrismaService, private readonly subjects: SubjectsService, private readonly config: ConfigService) {}

  async preview(ownerId: string, file: Express.Multer.File, subjectId?: string) {
    this.validateFile(file);
    if (subjectId) await this.subjects.requireOwned(ownerId, subjectId);
    const text = await this.extract(file);
    const items = parseQuestionImport(text);
    const session = await this.prisma.questionImport.create({
      data: {
        ownerId, subjectId: subjectId ?? null, fileName: safeName(file.originalname), totalCount: items.length,
        validCount: items.filter((item) => item.errors.length === 0).length, invalidCount: items.filter((item) => item.errors.length > 0).length,
        errorsJson: items.some((item) => item.errors.length === 0) ? Prisma.JsonNull : [{ field: 'file', message: 'File không có câu hỏi hợp lệ.' }],
        items: { create: items.map((item, orderIndex) => itemData(item, orderIndex)) },
      }, include: { items: { orderBy: { orderIndex: 'asc' } } },
    });
    return view(session);
  }

  async get(ownerId: string, id: string) { return view(await this.requireOwned(ownerId, id)); }

  async updateItem(ownerId: string, importId: string, itemId: string, input: QuestionImportItemUpdate) {
    const session = await this.requireOwned(ownerId, importId);
    if (session.status !== 'PREVIEW') throw new ConflictException({ code: 'IMPORT_ALREADY_COMMITTED', message: 'Import đã được xác nhận.' });
    const item = await this.prisma.questionImportItem.findFirst({ where: { id: itemId, importId } });
    if (!item) throw new NotFoundException({ code: 'IMPORT_ITEM_NOT_FOUND', message: 'Không tìm thấy câu hỏi preview.' });
    await this.prisma.$transaction(async (tx) => {
      await tx.questionImportItem.update({ where: { id: item.id }, data: { text: input.text, optionsJson: input.options, correctOptionKey: input.correctOptionKey, explanation: input.explanation, difficulty: input.difficulty, isValid: true, errorsJson: Prisma.JsonNull } });
      const counts = await tx.questionImportItem.groupBy({ by: ['isValid'], where: { importId }, _count: true });
      const validCount = counts.find((count) => count.isValid)?._count ?? 0;
      await tx.questionImport.update({ where: { id: importId }, data: { validCount, invalidCount: session.totalCount - validCount } });
    });
    return this.get(ownerId, importId);
  }

  async commit(ownerId: string, id: string) {
    const session = await this.requireOwned(ownerId, id);
    if (session.status === 'COMMITTED') throw new ConflictException({ code: 'IMPORT_ALREADY_COMMITTED', message: 'Import đã được xác nhận.' });
    const validItems = session.items.filter((item) => item.isValid);
    if (!validItems.length) throw new BadRequestException({ code: 'NO_VALID_IMPORT_ITEMS', message: 'Không có câu hỏi hợp lệ để nhập.' });
    await this.prisma.$transaction(async (tx) => {
      for (const item of validItems) {
        const options = item.optionsJson as unknown as { A: string; B: string; C: string; D: string };
        if (!item.text || !item.correctOptionKey || !options) throw new Error('INVALID_IMPORT_ITEM');
        await tx.question.create({ data: { ownerId, subjectId: session.subjectId, sourceType: 'IMPORT', status: 'DRAFT', text: item.text, options: { create: (['A', 'B', 'C', 'D'] as const).map((key, orderIndex) => ({ key, orderIndex, text: options[key] })) }, correctOptionKey: item.correctOptionKey, explanation: item.explanation || 'Không có lời giải thích.', difficulty: item.difficulty } });
      }
      await tx.questionImport.update({ where: { id }, data: { status: 'COMMITTED' } });
    });
    return this.get(ownerId, id);
  }

  private async requireOwned(ownerId: string, id: string) {
    const session = await this.prisma.questionImport.findFirst({ where: { id, ownerId }, include: { items: { orderBy: { orderIndex: 'asc' } } } });
    if (!session) throw new NotFoundException({ code: 'QUESTION_IMPORT_NOT_FOUND', message: 'Không tìm thấy import.' });
    return session;
  }

  private validateFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException({ code: 'FILE_REQUIRED', message: 'Hãy chọn file câu hỏi.' });
    const extension = file.originalname.split('.').pop()?.toLowerCase() || '';
    const mimeOk = extension in allowed && (allowed[extension as keyof typeof allowed] as readonly string[]).includes(file.mimetype);
    const magicOk = (extension === 'docx' && file.buffer.subarray(0, 2).toString() === 'PK') || (extension === 'txt' && !file.buffer.subarray(0, 512).includes(0));
    if (!mimeOk || !magicOk) throw new BadRequestException({ code: 'INVALID_IMPORT_FILE_TYPE', message: 'Chỉ hỗ trợ file DOCX hoặc TXT UTF-8 hợp lệ.' });
    const maxBytes = Number(this.config.get<string>('MAX_UPLOAD_BYTES') || 20 * 1024 * 1024);
    if (!file.size || file.size > maxBytes) throw new BadRequestException({ code: 'FILE_TOO_LARGE', message: `File vượt quá giới hạn ${Math.floor(maxBytes / 1024 / 1024)} MB.` });
  }

  private async extract(file: Express.Multer.File) {
    if (file.originalname.toLowerCase().endsWith('.txt')) {
      try { return new TextDecoder('utf-8', { fatal: true }).decode(file.buffer); }
      catch { throw new BadRequestException({ code: 'INVALID_IMPORT_ENCODING', message: 'File TXT phải dùng UTF-8.' }); }
    }
    return (await mammoth.extractRawText({ buffer: file.buffer })).value;
  }
}

function itemData(item: ParsedImportItem, orderIndex: number) {
  return { orderIndex, text: item.text, optionsJson: item.options ? item.options as Prisma.InputJsonValue : Prisma.JsonNull, correctOptionKey: item.correctOptionKey, explanation: item.explanation, isValid: item.errors.length === 0, errorsJson: item.errors.length ? item.errors : Prisma.JsonNull };
}

function safeName(name: string) { return name.replace(/[\\/\0\r\n]/g, '_').slice(0, 255) || 'questions'; }

function view(session: { id: string; fileName: string; status: string; totalCount: number; validCount: number; invalidCount: number; items: Array<{ id: string; orderIndex: number; text: string | null; optionsJson: unknown; correctOptionKey: string | null; explanation: string | null; difficulty: string; isValid: boolean; errorsJson: unknown }> }) {
  return { id: session.id, fileName: session.fileName, status: session.status, totalCount: session.totalCount, validCount: session.validCount, invalidCount: session.invalidCount, items: session.items.map((item) => {
    const options = questionOptionsSchema.safeParse(item.optionsJson);
    const errors = Array.isArray(item.errorsJson) ? item.errorsJson.flatMap((error) => { const parsed = questionImportErrorSchema.safeParse(error); return parsed.success ? [parsed.data] : []; }) : [];
    return { id: item.id, orderIndex: item.orderIndex, text: item.text, options: options.success ? options.data : null, correctOptionKey: item.correctOptionKey, explanation: item.explanation, difficulty: item.difficulty, isValid: item.isValid, errors };
  }) };
}
