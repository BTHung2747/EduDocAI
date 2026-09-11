import { HttpException, Injectable, Logger } from '@nestjs/common';
import { questionGenerationRequestSchema } from '@edudocs/contracts';
import { JobsRepository } from '../jobs/jobs.repository';
import { QuestionGenerationService } from './question-generation.service';

@Injectable()
export class QuestionGenerationWorker {
  private readonly logger = new Logger(QuestionGenerationWorker.name);

  constructor(
    private readonly jobs: JobsRepository,
    private readonly generations: QuestionGenerationService,
  ) {}

  start() {
    void this.processNext();
    setInterval(() => void this.processNext(), 1500).unref();
    this.logger.log('Question generation worker started');
  }

  async processNext() {
    const job = await this.jobs.claimNext('QUESTION_GENERATION');
    if (!job) return;

    const parsed = questionGenerationRequestSchema.safeParse(job.inputJson);
    if (!parsed.success) {
      await this.jobs.fail(job.id, 'INVALID_QUESTION_GENERATION_JOB');
      return;
    }

    try {
      const result = await this.generations.generate(job.ownerId, parsed.data);
      await this.jobs.succeed(job.id, { questionCount: result.questionCount }, result.provider, result.model);
    } catch (error) {
      const failure = this.failureFor(error);
      await this.jobs.fail(job.id, failure.code);
    }
  }

  private failureFor(error: unknown) {
    if (error instanceof HttpException) {
      const response = error.getResponse();
      if (typeof response === 'object' && response && 'code' in response) {
        if (response.code === 'AI_NOT_CONFIGURED') return { code: 'AI_NOT_CONFIGURED' };
        if (response.code === 'AI_UNAVAILABLE') return { code: 'AI_UNAVAILABLE' };
        if (response.code === 'DOCUMENT_NOT_READY') return { code: 'DOCUMENT_NOT_READY' };
      }
    }
    if (error instanceof Error && error.message === 'AI_INVALID_OUTPUT') return { code: 'AI_INVALID_OUTPUT' };
    return { code: 'QUESTION_GENERATION_FAILED' };
  }
}
