import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { questionGenerationRequestSchema, type QuestionGenerationRequest } from '@edudocs/contracts';
import { CurrentUser } from '../../common/auth/current-user.decorator';
import { JwtAccessGuard, type AccessUser } from '../../common/auth/jwt-access.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { QuestionGenerationService } from './question-generation.service';

@Controller('question-generations')
@UseGuards(JwtAccessGuard)
export class QuestionGenerationsController {
  constructor(private readonly generations: QuestionGenerationService) {}

  @Post()
  async create(
    @CurrentUser() user: AccessUser,
    @Body(new ZodValidationPipe(questionGenerationRequestSchema)) input: QuestionGenerationRequest,
  ) {
    const job = await this.generations.enqueue(user.id, input);
    return {
      data: {
        id: job.id,
        type: 'QUESTION_GENERATION' as const,
        status: job.status,
        createdAt: job.createdAt,
      },
    };
  }
}
