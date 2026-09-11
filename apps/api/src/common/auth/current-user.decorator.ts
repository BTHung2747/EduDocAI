import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AccessUser, AuthenticatedRequest } from './jwt-access.guard';

export const CurrentUser = createParamDecorator((_: unknown, context: ExecutionContext): AccessUser =>
  context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
