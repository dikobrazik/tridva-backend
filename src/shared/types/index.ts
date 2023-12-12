import {Request} from 'express';

export type AuthorizedRequest = Request & {userId: number};

export type SignatureContent = {
  userId: number;
};
