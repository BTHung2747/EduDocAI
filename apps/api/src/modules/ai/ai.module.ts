import { Module } from '@nestjs/common';
import { LocalEmbeddingProvider } from './local-embedding.provider';
import { VectorRepository } from './vector.repository';
import { OpenRouterProvider } from './openrouter.provider';
import { DocumentAnalysisService } from './document-analysis.service';
import { DocumentAnalysisWorker } from './document-analysis.worker';
import { AiJobsService } from './ai-jobs.service';
import { AiJobsController } from './ai-jobs.controller';
import { AuthModule } from '../auth/auth.module';
import { JobsModule } from '../jobs/jobs.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { AnalysisViewService } from './analysis-view.service';
import { GroundedQaService } from './grounded-qa.service';
import { QuestionGenerationService } from './question-generation.service';
import { QuestionGenerationWorker } from './question-generation.worker';
import { QuestionGenerationsController } from './question-generations.controller';
import { DocumentSubjectClassifier } from './document-subject-classifier.service';
import { SubjectClassificationController } from './subject-classification.controller';
import { EMBEDDING_PROVIDER, LLM_PROVIDER } from './ai.tokens';
export { EMBEDDING_PROVIDER, LLM_PROVIDER } from './ai.tokens';
@Module({ imports:[AuthModule,JobsModule,SubjectsModule], controllers:[AiJobsController, QuestionGenerationsController, SubjectClassificationController], providers: [LocalEmbeddingProvider, VectorRepository, OpenRouterProvider, DocumentAnalysisService, DocumentAnalysisWorker, DocumentSubjectClassifier, AiJobsService, AnalysisViewService, GroundedQaService, QuestionGenerationService, QuestionGenerationWorker, { provide: EMBEDDING_PROVIDER, useExisting: LocalEmbeddingProvider }, { provide: LLM_PROVIDER, useExisting: OpenRouterProvider }], exports: [EMBEDDING_PROVIDER, LLM_PROVIDER, LocalEmbeddingProvider, VectorRepository, DocumentAnalysisService, DocumentAnalysisWorker, DocumentSubjectClassifier, AiJobsService, AnalysisViewService, GroundedQaService, QuestionGenerationService, QuestionGenerationWorker] })
export class AiModule {}
