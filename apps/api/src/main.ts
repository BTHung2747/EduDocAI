import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { DocumentWorker } from './modules/documents/document.worker';
import { DocumentAnalysisWorker } from './modules/ai/document-analysis.worker';
import { QuestionGenerationWorker } from './modules/ai/question-generation.worker';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const allowedOrigins = config.getOrThrow<string>('CORS_ORIGIN').split(',').map((origin) => origin.trim());

  app.setGlobalPrefix('api/v1');
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new ApiExceptionFilter());

  // Local development is a single command: the persisted background jobs must run
  // alongside the HTTP API. Production retains the dedicated `start:worker` entrypoint.
  if (process.env.NODE_ENV !== 'production') {
    app.get(DocumentWorker).start();
    app.get(DocumentAnalysisWorker).start();
    app.get(QuestionGenerationWorker).start();
  }

  await app.listen(config.get<number>('PORT') ?? 3001);
}

void bootstrap();
