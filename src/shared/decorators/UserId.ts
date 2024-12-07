import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {AppRequest} from '../types';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();

    if (!request.userId) {
      throw new Error('No user in request. Use Token guard');
    }

    return request.userId;
  },
);
