import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { createQuestionSchema, questionListQuerySchema, updateQuestionSchema, type CreateQuestionInput, type QuestionListQuery, type UpdateQuestionInput } from '@edudocs/contracts';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAccessGuard, type AccessUser } from '../../common/auth/jwt-access.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { QuestionsService } from './questions.service';

@Controller('questions')
@UseGuards(JwtAccessGuard)
export class QuestionsController {
  constructor(private readonly questions: QuestionsService) {}
  @Get() async list(@CurrentUser() user: AccessUser, @Query(new ZodValidationPipe(questionListQuerySchema)) query: QuestionListQuery) { const result = await this.questions.list(user.id, query); return { data: result.items, meta: result.meta }; }
  @Post() async create(@CurrentUser() user: AccessUser, @Body(new ZodValidationPipe(createQuestionSchema)) input: CreateQuestionInput) { return { data: await this.questions.create(user.id, input) }; }
  @Get(':id') async get(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.questions.get(user.id, id) }; }
  @Patch(':id') async update(@CurrentUser() user: AccessUser, @Param('id') id: string, @Body(new ZodValidationPipe(updateQuestionSchema)) input: UpdateQuestionInput) { return { data: await this.questions.update(user.id, id, input) }; }
  @Delete(':id') @HttpCode(204) async remove(@CurrentUser() user: AccessUser, @Param('id') id: string) { await this.questions.remove(user.id, id); }
  @Post(':id/approve') async approve(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.questions.approve(user.id, id) }; }
}
