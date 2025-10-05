import { Request, Response } from 'express';

export class GQLContext {
  req!: Request;
  res!: Response;
}
