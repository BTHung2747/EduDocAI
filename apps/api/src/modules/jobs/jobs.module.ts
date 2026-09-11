import { Module } from '@nestjs/common';
import { JobsRepository } from './jobs.repository';
import { JobsWorker } from './jobs.worker';

@Module({ providers: [JobsRepository, JobsWorker], exports: [JobsRepository, JobsWorker] })
export class JobsModule {}
