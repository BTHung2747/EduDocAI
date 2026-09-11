import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'node:stream';
import { JobsRepository } from '../jobs/jobs.repository';
import { PrismaService } from '../prisma/prisma.service';
import { STORAGE_ADAPTER } from '../storage/storage.types';
import type { StorageAdapter } from '../storage/storage.types';
import { Inject } from '@nestjs/common';
import { extractDocument, NoExtractableTextError } from './document-extractor';
import { EMBEDDING_PROVIDER } from '../ai/ai.module';
import type { EmbeddingProvider } from '../ai/embedding.provider';
import { VectorRepository } from '../ai/vector.repository';
import { chunkSections } from '../ai/chunker';
import { DocumentSubjectClassifier } from '../ai/document-subject-classifier.service';

@Injectable()
export class DocumentWorker {
  private readonly logger = new Logger(DocumentWorker.name);
  constructor(private readonly jobs: JobsRepository, private readonly prisma: PrismaService, @Inject(STORAGE_ADAPTER) private readonly storage: StorageAdapter, @Inject(EMBEDDING_PROVIDER) private readonly embeddings: EmbeddingProvider, private readonly vectors: VectorRepository, private readonly subjectClassifier: DocumentSubjectClassifier) {}
  start() { void this.processNext(); setInterval(() => void this.processNext(), 1500).unref(); this.logger.log('Document worker started'); }
  async processNext() {
    const job = await this.jobs.claimNext('DOCUMENT_PROCESS'); if (!job) return;
    const documentId = job.documentId || (job.inputJson as { documentId?: string }).documentId;
    if (!documentId) { await this.jobs.fail(job.id, 'INVALID_DOCUMENT_JOB'); return; }
    try {
      const document = await this.prisma.document.findUnique({ where: { id: documentId } });
      if (!document || document.deletedAt) { await this.jobs.succeed(job.id); return; }
      const fileChunks: Buffer[] = []; const stream = await this.storage.getStream(document.storageKey);
      for await (const chunk of stream as Readable) fileChunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      const output = await extractDocument(Buffer.concat(fileChunks), document.extension);
      const chunkTemplates = chunkSections(output.sections.map((section, sectionOrder) => ({ sectionOrder, contentText: section.contentText, pageStart: section.pageStart, pageEnd: section.pageEnd })));
      const vectors = await this.embeddings.embed(chunkTemplates.map(chunk => chunk.contentText));
      if (vectors.length !== chunkTemplates.length || vectors.some(vector => vector.length !== 384)) throw new Error('EMBEDDING_DIMENSION_MISMATCH');
      await this.prisma.$transaction(async (tx) => { await tx.documentChunk.deleteMany({ where: { documentId } }); await tx.documentSection.deleteMany({ where: { documentId } }); const sections = await Promise.all(output.sections.map((section, orderIndex) => tx.documentSection.create({ data: { documentId, orderIndex, ...section } }))); const chunks = chunkTemplates.map(({ sectionOrder, ...chunk }) => ({ ...chunk, sectionId: sections[sectionOrder ?? -1]?.id })); await this.vectors.replace(documentId, chunks, vectors, tx); await tx.document.update({ where: { id: documentId }, data: { status: 'READY', pageCount: output.pageCount, errorCode: null, errorMessage: null } }); });
      await this.classifyReadyDocument(job.ownerId, documentId);
      await this.jobs.succeed(job.id);
    } catch (error) {
      const noText = error instanceof NoExtractableTextError;
      await this.prisma.document.updateMany({ where: { id: documentId }, data: { status: 'FAILED', errorCode: noText ? 'NO_EXTRACTABLE_TEXT' : 'EXTRACTION_FAILED', errorMessage: noText ? 'Tài liệu không có lớp văn bản có thể trích xuất.' : 'Không thể xử lý tài liệu. Bạn có thể thử lại.' } });
      await this.jobs.fail(job.id, noText ? 'NO_EXTRACTABLE_TEXT' : 'EXTRACTION_FAILED');
    }
  }

  async classifyReadyDocument(ownerId: string, documentId: string) {
    try {
      await this.subjectClassifier.classify(ownerId, documentId);
    } catch {
      this.logger.warn(`Subject classification failed for document ${documentId}`);
    }
  }
}
