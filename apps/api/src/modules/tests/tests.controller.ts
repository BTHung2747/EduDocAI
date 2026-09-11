import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { createTestSchema, testListQuerySchema, testQuestionIdsSchema, updateTestSchema, type CreateTestInput, type TestListQuery, type TestQuestionIdsInput, type UpdateTestInput } from '@edudocs/contracts';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAccessGuard, type AccessUser } from '../../common/auth/jwt-access.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { TestsService } from './tests.service';

@Controller('tests')
@UseGuards(JwtAccessGuard)
export class TestsController {
  constructor(private readonly tests: TestsService) {}
  @Get() async list(@CurrentUser() user: AccessUser, @Query(new ZodValidationPipe(testListQuerySchema)) query: TestListQuery) { const result = await this.tests.list(user.id, query); return { data: result.items, meta: result.meta }; }
  @Post() async create(@CurrentUser() user: AccessUser, @Body(new ZodValidationPipe(createTestSchema)) input: CreateTestInput) { return { data: await this.tests.create(user.id, input) }; }
  @Get(':id') async get(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.tests.get(user.id, id) }; }
  @Patch(':id') async update(@CurrentUser() user: AccessUser, @Param('id') id: string, @Body(new ZodValidationPipe(updateTestSchema)) input: UpdateTestInput) { return { data: await this.tests.update(user.id, id, input) }; }
  @Delete(':id') @HttpCode(204) async remove(@CurrentUser() user: AccessUser, @Param('id') id: string) { await this.tests.remove(user.id, id); }
  @Post(':id/questions') async addQuestions(@CurrentUser() user: AccessUser, @Param('id') id: string, @Body(new ZodValidationPipe(testQuestionIdsSchema)) input: TestQuestionIdsInput) { return { data: await this.tests.addQuestions(user.id, id, input) }; }
  @Delete(':id/questions/:questionId') async removeQuestion(@CurrentUser() user: AccessUser, @Param('id') id: string, @Param('questionId') questionId: string) { return { data: await this.tests.removeQuestion(user.id, id, questionId) }; }
  @Patch(':id/questions/reorder') async reorder(@CurrentUser() user: AccessUser, @Param('id') id: string, @Body(new ZodValidationPipe(testQuestionIdsSchema)) input: TestQuestionIdsInput) { return { data: await this.tests.reorderQuestions(user.id, id, input) }; }
  @Post(':id/publish') async publish(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.tests.publish(user.id, id) }; }
}
