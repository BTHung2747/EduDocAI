import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SubjectsController } from './subjects.controller';
import { SubjectsService } from './subjects.service';
import { DefaultSubjectsService } from './default-subjects.service';

@Module({ imports: [AuthModule], controllers: [SubjectsController], providers: [SubjectsService, DefaultSubjectsService], exports: [SubjectsService, DefaultSubjectsService] })
export class SubjectsModule {}
