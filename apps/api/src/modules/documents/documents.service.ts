import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { createHash, randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_ADAPTER } from '../storage/storage.types';
import type { StorageAdapter } from '../storage/storage.types';
import { JobsRepository } from '../jobs/jobs.repository';
import { SubjectsService } from '../subjects/subjects.service';

const allowed = { pdf: ['application/pdf'], docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'], txt: ['text/plain'] } as const;
const asDocument = (document: { sizeBytes: number; [key: string]: unknown }) => ({ ...document, sizeBytes: Number(document.sizeBytes) });

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService, private readonly jobs: JobsRepository, private readonly subjects: SubjectsService, @Inject(STORAGE_ADAPTER) private readonly storage: StorageAdapter) {}
  private maxBytes() { return Number(this.config.get<string>('MAX_UPLOAD_BYTES') || 20 * 1024 * 1024); }
  private quota() { return Number(this.config.get<string>('USER_STORAGE_QUOTA_BYTES') || 10 * 1024 * 1024 * 1024); }
  private async owned(ownerId: string, id: string) { const doc = await this.prisma.document.findFirst({ where: { id, ownerId, deletedAt: null }, include: { subject: true } }); if (!doc) throw new NotFoundException({ code: 'DOCUMENT_NOT_FOUND', message: 'Không tìm thấy tài liệu.' }); return doc; }
  async list(ownerId: string, query: { page?: string; pageSize?: string; q?: string; subjectId?: string; status?: string }) {
    const page = Math.max(1, Number(query.page) || 1); const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 10));
    const where = { ownerId, deletedAt: null, ...(query.subjectId ? { subjectId: query.subjectId } : {}), ...(query.status && ['PROCESSING','READY','FAILED'].includes(query.status) ? { status: query.status as 'PROCESSING' } : {}), ...(query.q?.trim() ? { OR: [{ displayName: { contains: query.q.trim(), mode: 'insensitive' as const } }, { originalName: { contains: query.q.trim(), mode: 'insensitive' as const } }] } : {}) };
    const [total, items, used] = await this.prisma.$transaction([this.prisma.document.count({ where }), this.prisma.document.findMany({ where, include: { subject: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }), this.prisma.document.aggregate({ where: { ownerId, deletedAt: null }, _sum: { sizeBytes: true } })]);
    return { data: items.map(asDocument), meta: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)), quota: { usedBytes: used._sum.sizeBytes || 0, limitBytes: this.quota() }, maxUploadBytes: this.maxBytes() } };
  }
  async upload(ownerId: string, file: Express.Multer.File, subjectId?: string) {
    if (!file) throw new BadRequestException({ code: 'FILE_REQUIRED', message: 'Hãy chọn một tệp tài liệu.' });
    const extension = file.originalname.split('.').pop()?.toLowerCase() || ''; const mimeOk = extension in allowed && (allowed[extension as keyof typeof allowed] as readonly string[]).includes(file.mimetype);
    const magicOk = (extension === 'pdf' && file.buffer.subarray(0, 5).toString() === '%PDF-') || (extension === 'docx' && file.buffer.subarray(0, 2).toString() === 'PK') || (extension === 'txt' && !file.buffer.subarray(0, 512).includes(0));
    if (!mimeOk || !magicOk) throw new BadRequestException({ code: 'INVALID_FILE_TYPE', message: 'Chỉ hỗ trợ tệp PDF, DOCX hoặc TXT hợp lệ.' });
    if (!file.size || file.size > this.maxBytes()) throw new BadRequestException({ code: 'FILE_TOO_LARGE', message: `Tệp vượt quá giới hạn ${Math.floor(this.maxBytes() / 1024 / 1024)} MB.` });
    if (subjectId) await this.subjects.requireOwned(ownerId, subjectId);
    const [used, same] = await this.prisma.$transaction([this.prisma.document.aggregate({ where: { ownerId, deletedAt: null }, _sum: { sizeBytes: true } }), this.prisma.document.findFirst({ where: { ownerId, checksum: createHash('sha256').update(file.buffer).digest('hex'), deletedAt: null } })]);
    if ((used._sum.sizeBytes || 0) + file.size > this.quota()) throw new BadRequestException({ code: 'STORAGE_QUOTA_EXCEEDED', message: 'Dung lượng lưu trữ đã vượt quota tài khoản.' });
    if (same) throw new ConflictException({ code: 'DUPLICATE_DOCUMENT', message: 'Tệp này đã được tải lên trước đó.' });
    const checksum = createHash('sha256').update(file.buffer).digest('hex'); const storageKey = `${randomUUID()}.${extension}`;
    await this.storage.put({ key: storageKey, body: file.buffer, contentType: file.mimetype });
    try { const document = await this.prisma.document.create({ data: { ownerId, subjectId: subjectId || null, ...(subjectId ? { subjectAssignmentSource: 'MANUAL', subjectAssignedAt: new Date() } : {}), displayName: file.originalname.replace(/\.[^.]+$/, '').slice(0, 255) || 'Tài liệu', originalName: file.originalname.replace(/[\\/\0]/g, '_').slice(0, 255), mimeType: file.mimetype, extension, sizeBytes: file.size, storageKey, checksum, status: 'PROCESSING' }, include: { subject: true } }); await this.jobs.enqueue(ownerId, 'DOCUMENT_PROCESS', { documentId: document.id }, document.id); return asDocument(document); } catch (error) { await this.storage.delete(storageKey); throw error; }
  }
  async get(ownerId: string, id: string) { return asDocument(await this.owned(ownerId, id)); }
  async update(ownerId: string, id: string, input: { displayName?: string; subjectId?: string | null }) { await this.owned(ownerId, id); if (input.subjectId) await this.subjects.requireOwned(ownerId, input.subjectId); return asDocument(await this.prisma.document.update({ where: { id }, data: { ...(input.displayName ? { displayName: input.displayName } : {}), ...(input.subjectId !== undefined ? { subjectId: input.subjectId, subjectAssignmentSource: 'MANUAL', subjectConfidence: null, subjectAssignedAt: new Date() } : {}) }, include: { subject: true } })); }
  async remove(ownerId: string, id: string) { await this.owned(ownerId, id); await this.prisma.document.update({ where: { id }, data: { deletedAt: new Date() } }); }
  async content(ownerId: string, id: string) { const document = await this.owned(ownerId, id); if (document.status !== 'READY') throw new ConflictException({ code: 'DOCUMENT_NOT_READY', message: 'Tài liệu vẫn đang được xử lý.' }); const sections = await this.prisma.documentSection.findMany({ where: { documentId: id }, orderBy: { orderIndex: 'asc' } }); return { document: asDocument(document), sections }; }
  async retry(ownerId: string, id: string) { await this.owned(ownerId, id); const document = await this.prisma.document.update({ where: { id }, data: { status: 'PROCESSING', errorCode: null, errorMessage: null }, include: { subject: true } }); await this.jobs.enqueue(ownerId, 'DOCUMENT_PROCESS', { documentId: id }, id); return asDocument(document); }
  async stream(ownerId: string, id: string) { const document = await this.owned(ownerId, id); return { document, stream: await this.storage.getStream(document.storageKey) }; }
}
