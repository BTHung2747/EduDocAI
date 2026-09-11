import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { updateDocumentSchema } from '@edudocs/contracts';
import type { Response } from 'express';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAccessGuard } from '../../common/auth/jwt-access.guard';
import type { AccessUser } from '../../common/auth/jwt-access.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { DocumentsService } from './documents.service';
import { AnalysisViewService } from '../ai/analysis-view.service';
import { GroundedQaService } from '../ai/grounded-qa.service';
import { documentAskRequestSchema } from '@edudocs/contracts';

@Controller('documents')
@UseGuards(JwtAccessGuard)
export class DocumentsController {
  constructor(private readonly documents: DocumentsService, private readonly analysisViews: AnalysisViewService, private readonly qa: GroundedQaService) {}
  @Get() list(@CurrentUser() user: AccessUser, @Query() query: { page?: string; pageSize?: string; q?: string; subjectId?: string; status?: string }) { return this.documents.list(user.id, query); }
  @Post() @UseInterceptors(FileInterceptor('file')) async upload(@CurrentUser() user: AccessUser, @UploadedFile() file: Express.Multer.File, @Body('subjectId') subjectId?: string) { return { data: await this.documents.upload(user.id, file, subjectId || undefined) }; }
  @Get(':id') async get(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.documents.get(user.id, id) }; }
  @Get(':id/summary') async summary(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.analysisViews.get(user.id, id, 'summary') }; }
  @Get(':id/topics') async topics(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.analysisViews.get(user.id, id, 'topics') }; }
  @Post(':id/ask') async ask(@CurrentUser() user: AccessUser,@Param('id') id:string,@Body(new ZodValidationPipe(documentAskRequestSchema)) body:{question:string}) { return {data:await this.qa.ask(user.id,id,body.question)}; }
  @Patch(':id') async update(@CurrentUser() user: AccessUser, @Param('id') id: string, @Body(new ZodValidationPipe(updateDocumentSchema)) body: { displayName?: string; subjectId?: string | null }) { return { data: await this.documents.update(user.id, id, body) }; }
  @Delete(':id') @HttpCode(204) async remove(@CurrentUser() user: AccessUser, @Param('id') id: string) { await this.documents.remove(user.id, id); }
  @Get(':id/content') async content(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.documents.content(user.id, id) }; }
  @Get(':id/download') async download(@CurrentUser() user: AccessUser, @Param('id') id: string, @Res() response: Response) { const { document, stream } = await this.documents.stream(user.id, id); const safe = document.originalName.replace(/[\r\n\\/]/g, '_'); response.setHeader('Content-Type', document.mimeType); response.setHeader('Content-Disposition', `attachment; filename="${safe}"`); stream.pipe(response); }
  @Post(':id/retry') async retry(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.documents.retry(user.id, id) }; }
}
