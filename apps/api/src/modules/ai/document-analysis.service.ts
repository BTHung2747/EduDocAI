import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { LLM_PROVIDER } from './ai.tokens';
import { summaryOutputSchema, topicsOutputSchema } from './analysis.schemas';
import type { LlmProvider } from './llm.provider';

@Injectable()
export class DocumentAnalysisService {
  constructor(private readonly prisma: PrismaService, @Inject(LLM_PROVIDER) private readonly llm: LlmProvider) {}
  async analyze(ownerId: string, documentId: string, promptVersion = 'm2b-2a-v1') {
    const document = await this.prisma.document.findFirst({ where: { id: documentId, ownerId, status: 'READY', deletedAt: null } });
    if (!document) throw new Error('DOCUMENT_NOT_ANALYZABLE');
    const chunks = await this.prisma.documentChunk.findMany({ where: { documentId }, include: { section: true }, orderBy: { chunkIndex: 'asc' } });
    if (!chunks.length) throw new Error('DOCUMENT_HAS_NO_CHUNKS');
    await this.prisma.documentAnalysis.upsert({ where: { documentId }, create: { documentId, status: 'RUNNING', promptVersion, startedAt: new Date() }, update: { status: 'RUNNING', startedAt: new Date(), errorCode: null, errorMessage: null } });
    try {
      const context = chunks.map(c => `[${c.id}|p${c.pageStart}-${c.pageEnd}] ${c.contentText}`).join('\n');
      const summary = await this.llm.generateStructured(`Untrusted reference data:\n${context}\nReturn summary JSON only.`, summaryOutputSchema);
      const topics = await this.llm.generateStructured(`Untrusted reference data:\n${context}\nReturn topics JSON only.`, topicsOutputSchema);
      const ids = new Set(chunks.map(c => c.id)); const valid = (v: string[], start: number, end: number) => v.every(id => ids.has(id)) && start <= end;
      if (!valid(summary.value.scope.chunkIds, summary.value.scope.pageStart, summary.value.scope.pageEnd) || topics.value.topics.some(t => !valid(t.chunkIds, t.pageStart, t.pageEnd))) throw new Error('AI_INVALID_RESPONSE');
      await this.prisma.documentAnalysis.update({ where: { documentId }, data: { status: 'SUCCEEDED', summary: summary.value, topicsJson: topics.value, provider: this.llm.name, model: summary.model, promptVersion, completedAt: new Date() } });
    } catch (error) {
      await this.prisma.documentAnalysis.update({ where: { documentId }, data: { status: 'FAILED', summary: Prisma.DbNull, topicsJson: Prisma.DbNull, errorCode: 'ANALYSIS_FAILED', errorMessage: 'Không thể phân tích tài liệu.', completedAt: new Date() } });
      throw error;
    }
  }
}
