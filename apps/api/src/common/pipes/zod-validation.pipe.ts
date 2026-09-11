import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
  constructor(private readonly schema: ZodType<T>) {}

  transform(value: unknown): T {
    const parsed = this.schema.safeParse(value);
    if (parsed.success) return parsed.data;

    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    throw new BadRequestException({
      code: 'VALIDATION_ERROR',
      message: 'Dữ liệu gửi lên chưa hợp lệ.',
      fieldErrors,
    });
  }
}
