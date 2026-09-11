import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DEFAULT_SUBJECT_PROFILES } from './default-subject-profiles';

export type DefaultSubjectsResult = { created: number; skipped: number };

export function normalizeSubjectName(name: string) {
  return name.normalize('NFKC').trim().toLocaleLowerCase();
}

export async function ensureDefaultSubjects(prisma: PrismaService, ownerId: string): Promise<DefaultSubjectsResult> {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.subject.findMany({
      where: { ownerId, deletedAt: null },
      select: { name: true },
    });
    const existingNames = new Set(existing.map((subject) => normalizeSubjectName(subject.name)));
    const missing = DEFAULT_SUBJECT_PROFILES.filter((profile) => !existingNames.has(normalizeSubjectName(profile.name)));
    if (missing.length) {
      await Promise.all(missing.map((profile) => tx.subject.create({ data: { ownerId, ...profile } })));
    }
    return { created: missing.length, skipped: DEFAULT_SUBJECT_PROFILES.length - missing.length };
  });
}

@Injectable()
export class DefaultSubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  ensure(ownerId: string) {
    return ensureDefaultSubjects(this.prisma, ownerId);
  }
}
