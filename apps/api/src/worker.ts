import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentWorker } from './modules/documents/document.worker';
import { DocumentAnalysisWorker } from './modules/ai/document-analysis.worker';
import { QuestionGenerationWorker } from './modules/ai/question-generation.worker';

async function bootstrapWorker() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.get(DocumentWorker).start();
  app.get(DocumentAnalysisWorker).start();
  app.get(QuestionGenerationWorker).start();
}

void bootstrapWorker();
