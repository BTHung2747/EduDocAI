import { Injectable } from '@nestjs/common';
import { AiJobStatus, Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  enqueue(ownerId: string, type: string, inputJson: Prisma.InputJsonValue, documentId?: string, tx: Prisma.TransactionClient = this.prisma) {
    return tx.aiJob.create({ data: { ownerId, type, inputJson, documentId } });
  }

  async claimNext(type: string) {
    const queued = await this.prisma.aiJob.findFirst({
      where: { status: AiJobStatus.QUEUED, type },
      orderBy: { createdAt: 'asc' },
    });
    if (!queued) return null;

    const claimed = await this.prisma.aiJob.updateMany({
      where: { id: queued.id, status: AiJobStatus.QUEUED },
      data: { status: AiJobStatus.RUNNING, startedAt: new Date(), attempts: { increment: 1 } },
    });
    return claimed.count === 1 ? this.prisma.aiJob.findUnique({ where: { id: queued.id } }) : null;
  }

  fail(jobId: string, errorCode: string) {
    return this.prisma.aiJob.update({
      where: { id: jobId },
      data: { status: AiJobStatus.FAILED, errorCode, finishedAt: new Date() },
    });
  }

  succeed(jobId: string, resultJson?: Prisma.InputJsonValue, provider?: string, model?: string) {
    return this.prisma.aiJob.update({
      where: { id: jobId },
      data: {
        status: AiJobStatus.SUCCEEDED,
        finishedAt: new Date(),
        ...(resultJson ? { resultJson } : {}),
        ...(provider ? { provider } : {}),
        ...(model ? { model } : {}),
      },
    });
  }
}
