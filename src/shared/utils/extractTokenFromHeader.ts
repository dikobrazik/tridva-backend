import {Request} from 'express';

export const extractTokenFromRequest = (
  request: Request,
): string | undefined => {
  return request.cookies['token'];
};
