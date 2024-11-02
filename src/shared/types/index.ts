import {Request, Response} from 'express';

export type AppResponse = Response;

export type AppRequest = Request & {userId: number};

export type SignatureContent = {
  userId: number;
};
