import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { attemptListQuerySchema, saveAttemptAnswerSchema, type AttemptListQuery, type SaveAttemptAnswerInput } from '@edudocs/contracts';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAccessGuard, type AccessUser } from '../../common/auth/jwt-access.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AttemptsService } from './attempts.service';

@Controller('tests')
@UseGuards(JwtAccessGuard)
export class TestAttemptsController {
  constructor(private readonly attempts: AttemptsService) {}
  @Post(':id/attempts') async start(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.attempts.start(user.id, id) }; }
}

@Controller()
@UseGuards(JwtAccessGuard)
export class AttemptsController {
  constructor(private readonly attempts: AttemptsService) {}
  @Get('attempts/:id') async get(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.attempts.progress(user.id, id) }; }
  @Patch('attempts/:id/answers/:testQuestionId') async save(@CurrentUser() user: AccessUser, @Param('id') id: string, @Param('testQuestionId') testQuestionId: string, @Body(new ZodValidationPipe(saveAttemptAnswerSchema)) input: SaveAttemptAnswerInput) { return { data: await this.attempts.saveAnswer(user.id, id, testQuestionId, input) }; }
  @Post('attempts/:id/submit') async submit(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.attempts.submit(user.id, id) }; }
  @Get('attempts/:id/result') async result(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.attempts.result(user.id, id) }; }
  @Get('results') async list(@CurrentUser() user: AccessUser, @Query(new ZodValidationPipe(attemptListQuerySchema)) query: AttemptListQuery) { const result = await this.attempts.list(user.id, query); return { data: result.items, meta: result.meta }; }
}
