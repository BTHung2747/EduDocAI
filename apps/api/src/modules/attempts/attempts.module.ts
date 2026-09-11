import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AttemptsController, TestAttemptsController } from './attempts.controller';
import { AttemptsService } from './attempts.service';

@Module({ imports: [AuthModule], controllers: [AttemptsController, TestAttemptsController], providers: [AttemptsService] })
export class AttemptsModule {}
