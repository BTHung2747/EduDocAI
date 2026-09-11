import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsRepository } from '../jobs/jobs.repository';

@Injectable()
export class AiJobsService {
  constructor(private readonly prisma: PrismaService, private readonly jobs: JobsRepository) {}

  async create(ownerId: string, input: { documentId: string; retry: boolean }) {
    return this.prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<Array<{ id: string }>>`
        SELECT id FROM "Document"
        WHERE id=${input.documentId}::uuid AND "ownerId"=${ownerId}::uuid
          AND "deletedAt" IS NULL AND status='READY'
        FOR UPDATE
      `;
      if (!rows.length) throw new NotFoundException({ code: 'DOCUMENT_NOT_READY', message: 'Không tìm thấy tài liệu sẵn sàng.' });
      const active = await tx.aiJob.findFirst({ where: { ownerId, documentId: input.documentId, type: 'DOCUMENT_ANALYSIS', status: { in: ['QUEUED', 'RUNNING'] } } });
      if (active) return active;
      const analysis = await tx.documentAnalysis.findUnique({ where: { documentId: input.documentId } });
      if (analysis?.status === 'SUCCEEDED' && !input.retry) {
        const last = await tx.aiJob.findFirst({ where: { ownerId, documentId: input.documentId, type: 'DOCUMENT_ANALYSIS' }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
        if (last) return last;
      }
      await tx.documentAnalysis.upsert({ where: { documentId: input.documentId }, create: { documentId: input.documentId, status: 'QUEUED' }, update: { status: 'QUEUED', errorCode: null, errorMessage: null, completedAt: null } });
      return this.jobs.enqueue(ownerId, 'DOCUMENT_ANALYSIS', { documentId: input.documentId }, input.documentId, tx);
    });
  }

  // Shared by document analysis and question-generation UI.
  async list(ownerId: string, query: { page?: number; pageSize?: number; status?: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'; documentId?: string; type?: string }) {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));
    const where = { ownerId, ...(query.type ? { type: query.type } : {}), ...(query.status ? { status: query.status } : {}), ...(query.documentId ? { documentId: query.documentId } : {}) };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.aiJob.count({ where }),
      this.prisma.aiJob.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (page - 1) * pageSize, take: pageSize }),
    ]);
    return { items, total, page, pageSize };
  }

  async get(ownerId: string, id: string) {
    const job = await this.prisma.aiJob.findFirst({ where: { id, ownerId } });
    if (!job) throw new NotFoundException({ code: 'JOB_NOT_FOUND', message: 'Không tìm thấy tác vụ.' });
    return job;
  }
}
