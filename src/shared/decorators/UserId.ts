import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {AppRequest} from '../types';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    return request.userId;
  },
);
