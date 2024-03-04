import {Request} from 'express';

export const extractTokenFromRequest = (
  request: Request,
): string | undefined => {
  if ('token' in request.cookies) {
    return request.cookies['token'];
  }

  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};
