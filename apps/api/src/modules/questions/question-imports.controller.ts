import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { questionImportItemUpdateSchema, type QuestionImportItemUpdate } from '@edudocs/contracts';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAccessGuard, type AccessUser } from '../../common/auth/jwt-access.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { QuestionImportService } from './question-import.service';

@Controller('question-imports')
@UseGuards(JwtAccessGuard)
export class QuestionImportsController {
  constructor(private readonly imports: QuestionImportService) {}
  @Post() @UseInterceptors(FileInterceptor('file')) async preview(@CurrentUser() user: AccessUser, @UploadedFile() file: Express.Multer.File, @Body('subjectId') subjectId?: string) { return { data: await this.imports.preview(user.id, file, subjectId || undefined) }; }
  @Get(':id') async get(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.imports.get(user.id, id) }; }
  @Patch(':id/items/:itemId') async updateItem(@CurrentUser() user: AccessUser, @Param('id') id: string, @Param('itemId') itemId: string, @Body(new ZodValidationPipe(questionImportItemUpdateSchema)) input: QuestionImportItemUpdate) { return { data: await this.imports.updateItem(user.id, id, itemId, input) }; }
  @Post(':id/commit') async commit(@CurrentUser() user: AccessUser, @Param('id') id: string) { return { data: await this.imports.commit(user.id, id) }; }
}
