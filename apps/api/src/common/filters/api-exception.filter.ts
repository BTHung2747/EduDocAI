import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

type ExceptionResponse = string | { message?: string | string[]; code?: string; fieldErrors?: Record<string, string[]> };

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const payload = isHttpException ? (exception.getResponse() as ExceptionResponse) : undefined;
    const message =
      typeof payload === 'string'
        ? payload
        : Array.isArray(payload?.message)
          ? payload.message.join(', ')
          : (payload?.message ?? 'Đã xảy ra lỗi. Vui lòng thử lại.');

    response.status(status).json({
      error: {
        code: typeof payload === 'object' && payload?.code ? payload.code : this.codeFor(status),
        message,
        fieldErrors: typeof payload === 'object' ? payload?.fieldErrors : undefined,
      },
      meta: { path: request.url },
    });
  }

  private codeFor(status: number) {
    if (status === HttpStatus.UNAUTHORIZED) return 'UNAUTHORIZED';
    if (status === HttpStatus.FORBIDDEN) return 'FORBIDDEN';
    if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND';
    if (status === HttpStatus.CONFLICT) return 'CONFLICT';
    if (status === HttpStatus.BAD_REQUEST) return 'VALIDATION_ERROR';
    return 'INTERNAL_ERROR';
  }
}
