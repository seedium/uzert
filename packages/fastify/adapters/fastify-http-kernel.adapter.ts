import { FastifyError } from 'fastify';
import { HttpKernelAdapter } from '@uzert/core';
import { Request, Response } from '../interfaces';

export class FastifyHttpKernelAdapter implements HttpKernelAdapter<Request, Response> {
  public plugins = [];

  public async notFoundHandler(_req: Request, _res: Response): Promise<any> {
    return {
      message: 'Route not found',
    };
  }

  public async errorHandler(err: Error | FastifyError, _req: Request, _res: Response): Promise<any> {
    return {
      message: err.message,
    };
  }

  public async validateRequest(_req: Request, _res: Response): Promise<void> {
    return;
  }

  public async validateResponse<Payload = any>(req: Request, res: Response, payload: Payload): Promise<Payload> {
    return payload;
  }
}
