import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { subjectInputSchema } from '@edudocs/contracts';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAccessGuard } from '../../common/auth/jwt-access.guard';
import type { AccessUser } from '../../common/auth/jwt-access.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { SubjectsService } from './subjects.service';
import { DefaultSubjectsService } from './default-subjects.service';

@Controller('subjects')
@UseGuards(JwtAccessGuard)
export class SubjectsController {
  constructor(private readonly subjects: SubjectsService, private readonly defaults: DefaultSubjectsService) {}
  @Get() async list(@CurrentUser() user: AccessUser) { return { data: await this.subjects.list(user.id) }; }
  @Post('defaults') async createDefaults(@CurrentUser() user: AccessUser) { return { data: await this.defaults.ensure(user.id) }; }
  @Post() async create(@CurrentUser() user: AccessUser, @Body(new ZodValidationPipe(subjectInputSchema)) body: { name: string; description?: string | null }) { return { data: await this.subjects.create(user.id, body) }; }
  @Patch(':id') async update(@CurrentUser() user: AccessUser, @Param('id') id: string, @Body(new ZodValidationPipe(subjectInputSchema)) body: { name: string; description?: string | null }) { return { data: await this.subjects.update(user.id, id, body) }; }
  @Delete(':id') @HttpCode(204) async remove(@CurrentUser() user: AccessUser, @Param('id') id: string) { await this.subjects.remove(user.id, id); }
}
