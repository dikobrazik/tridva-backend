import {Request} from 'express';

export type AppRequest = Request & {userId: number};

export type SignatureContent = {
  userId: number;
};
