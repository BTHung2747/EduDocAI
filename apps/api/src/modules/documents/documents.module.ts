import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { JobsModule } from '../jobs/jobs.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentWorker } from './document.worker';
import { DocumentReindexService } from './document-reindex.service';
import { AiModule } from '../ai/ai.module';

@Module({ imports: [AuthModule, JobsModule, SubjectsModule, AiModule], controllers: [DocumentsController], providers: [DocumentsService, DocumentWorker, DocumentReindexService], exports: [DocumentWorker, DocumentReindexService] })
export class DocumentsModule {}
