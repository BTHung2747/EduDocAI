import { Injectable, Logger } from '@nestjs/common';

/**
 * M0 lifecycle scaffold. M1 adds document processors; M2 adds AI processors.
 * Jobs are persisted in PostgreSQL and must be idempotent when a processor is introduced.
 */
@Injectable()
export class JobsWorker {
  private readonly logger = new Logger(JobsWorker.name);

  start() {
    this.logger.log('Generic job worker is inactive; document jobs use DocumentWorker.');
  }
}
