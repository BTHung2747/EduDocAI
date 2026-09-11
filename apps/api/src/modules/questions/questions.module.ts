import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SubjectsModule } from '../subjects/subjects.module';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';
import { QuestionImportsController } from './question-imports.controller';
import { QuestionImportService } from './question-import.service';

@Module({ imports: [AuthModule, SubjectsModule], controllers: [QuestionsController, QuestionImportsController], providers: [QuestionsService, QuestionImportService], exports: [QuestionsService, QuestionImportService] })
export class QuestionsModule {}
