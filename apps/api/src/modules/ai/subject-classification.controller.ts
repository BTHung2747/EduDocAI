import { Controller, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAccessGuard, type AccessUser } from '../../common/auth/jwt-access.guard';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentSubjectClassifier } from './document-subject-classifier.service';

@Controller('subjects')
@UseGuards(JwtAccessGuard)
export class SubjectClassificationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly classifier: DocumentSubjectClassifier,
  ) {}

  @Post('reclassify')
  async reclassifyReadyDocuments(@CurrentUser() user: AccessUser) {
    const documents = await this.prisma.document.findMany({
      where: {
        ownerId: user.id,
        deletedAt: null,
        status: 'READY',
        OR: [{ subjectAssignmentSource: null }, { subjectAssignmentSource: 'AI' }],
      },
      select: { id: true },
      orderBy: { createdAt: 'asc' },
    });

    let assigned = 0;
    let skipped = 0;
    for (const document of documents) {
      const result = await this.classifier.classify(user.id, document.id);
      if (result.assigned) assigned += 1;
      else skipped += 1;
    }

    return { data: { processed: documents.length, assigned, skipped } };
  }
}
