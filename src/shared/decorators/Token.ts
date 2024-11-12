import {createParamDecorator, ExecutionContext} from '@nestjs/common';
import {AppRequest} from '../types';

export const Token = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AppRequest>();
    return request.headers.authorization
      ? request.headers.authorization.replace('Bearer ', '')
      : request.cookies['token'];
  },
);
