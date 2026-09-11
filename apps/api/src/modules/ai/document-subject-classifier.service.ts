import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { EMBEDDING_PROVIDER } from './ai.tokens';
import type { EmbeddingProvider } from './embedding.provider';
import { cosineSimilarity } from './vector.repository';
import { Inject } from '@nestjs/common';

const REPRESENTATIVE_CHUNK_COUNT = 6;
const REPRESENTATIVE_CHUNK_LENGTH = 900;

type AssignmentResult =
  | { assigned: true; subjectId: string; confidence: number }
  | { assigned: false; confidence: number | null };

@Injectable()
export class DocumentSubjectClassifier {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @Inject(EMBEDDING_PROVIDER) private readonly embeddings: EmbeddingProvider,
  ) {}

  async classify(ownerId: string, documentId: string): Promise<AssignmentResult> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, ownerId, deletedAt: null, status: 'READY' },
      select: { id: true, displayName: true, subjectAssignmentSource: true },
    });
    if (!document || document.subjectAssignmentSource === 'MANUAL') return { assigned: false, confidence: null };

    const subjects = await this.prisma.subject.findMany({
      where: { ownerId, deletedAt: null },
      select: { id: true, name: true, description: true },
      orderBy: { name: 'asc' },
    });
    if (!subjects.length) return { assigned: false, confidence: null };

    const chunks = await this.prisma.documentChunk.findMany({
      where: { documentId },
      select: { contentText: true, section: { select: { title: true } } },
      orderBy: { chunkIndex: 'asc' },
    });
    if (!chunks.length) return { assigned: false, confidence: null };

    const representativeText = this.representativeText(document.displayName, chunks);
    const subjectTexts = subjects.map((subject) => `${subject.name}\n${subject.description ?? ''}`.trim());
    const vectors = await this.embeddings.embed([representativeText, ...subjectTexts]);
    if (vectors.length !== subjects.length + 1 || vectors.some((vector) => vector.length !== 384)) {
      throw new Error('EMBEDDING_DIMENSION_MISMATCH');
    }

    const documentVector = vectors[0];
    const ranked = subjects
      .map((subject, index) => ({ subject, score: cosineSimilarity(documentVector, vectors[index + 1]) }))
      .filter((candidate): candidate is { subject: (typeof subjects)[number]; score: number } => candidate.score !== null)
      .sort((left, right) => right.score - left.score || left.subject.id.localeCompare(right.subject.id));

    const best = ranked[0];
    const secondBest = ranked[1];
    const threshold = this.config.get<number>('SUBJECT_CLASSIFICATION_THRESHOLD') ?? 0.55;
    const minMargin = this.config.get<number>('SUBJECT_CLASSIFICATION_MIN_MARGIN') ?? 0.05;
    const canAssign = Boolean(best && best.score >= threshold && best.score - (secondBest?.score ?? -1) >= minMargin);

    await this.prisma.document.updateMany({
      where: {
        id: document.id,
        ownerId,
        OR: [{ subjectAssignmentSource: null }, { subjectAssignmentSource: 'AI' }],
      },
      data: canAssign && best
        ? {
            subjectId: best.subject.id,
            subjectAssignmentSource: 'AI',
            subjectConfidence: best.score,
            subjectAssignedAt: new Date(),
          }
        : {
            subjectId: null,
            subjectAssignmentSource: null,
            subjectConfidence: null,
            subjectAssignedAt: null,
          },
    });

    return canAssign && best
      ? { assigned: true, subjectId: best.subject.id, confidence: best.score }
      : { assigned: false, confidence: best?.score ?? null };
  }

  private representativeText(
    displayName: string,
    chunks: Array<{ contentText: string; section: { title: string | null } | null }>,
  ) {
    const selected = evenlySelect(chunks, REPRESENTATIVE_CHUNK_COUNT);
    return [
      `Tên tài liệu: ${displayName}`,
      ...selected.map((chunk) => [
        chunk.section?.title ? `Phần: ${chunk.section.title}` : null,
        chunk.contentText.slice(0, REPRESENTATIVE_CHUNK_LENGTH),
      ].filter(Boolean).join('\n')),
    ].join('\n\n');
  }
}

function evenlySelect<T>(items: T[], limit: number) {
  if (items.length <= limit) return items;
  const stride = (items.length - 1) / (limit - 1);
  return Array.from({ length: limit }, (_, index) => items[Math.round(index * stride)]);
}
