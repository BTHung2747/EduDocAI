import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { createAiJobRequestSchema } from '@edudocs/contracts';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAccessGuard, type AccessUser } from '../../common/auth/jwt-access.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AiJobsService } from './ai-jobs.service';

const publicJob = (job: Record<string, unknown>) => {
  const copy = { ...job };
  delete copy.inputJson;
  return copy;
};

@Controller('ai/jobs')
@UseGuards(JwtAccessGuard)
export class AiJobsController {
  constructor(private readonly jobs: AiJobsService) {}

  @Post()
  async create(@CurrentUser() user: AccessUser, @Body(new ZodValidationPipe(createAiJobRequestSchema)) body: { documentId: string; retry: boolean }) {
    return { data: publicJob(await this.jobs.create(user.id, body) as unknown as Record<string, unknown>) };
  }

  @Get()
  async list(@CurrentUser() user: AccessUser, @Query() query: { page?: string; pageSize?: string; status?: 'QUEUED' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'; documentId?: string; type?: string }) {
    const result = await this.jobs.list(user.id, { ...query, page: Number(query.page) || 1, pageSize: Number(query.pageSize) || 20 });
    return { data: result.items.map((job) => publicJob(job as unknown as Record<string, unknown>)), meta: { page: result.page, pageSize: result.pageSize, total: result.total } };
  }

  @Get(':id')
  async get(@CurrentUser() user: AccessUser, @Param('id') id: string) {
    return { data: publicJob(await this.jobs.get(user.id, id) as unknown as Record<string, unknown>) };
  }
}
