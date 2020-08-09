import { FastifyError } from 'fastify';
import { HttpKernelAdapter } from '@uzert/core';
import { Request, Response, IPluginKernel } from '../interfaces';

export class FastifyHttpKernelAdapter
  implements HttpKernelAdapter<Request, Response> {
  public plugins: IPluginKernel[] = [];

  public async notFoundHandler(
    _req: Request,
    _res: Response,
  ): Promise<unknown> {
    return {
      message: 'Route not found',
    };
  }

  public async errorHandler(
    err: Error | FastifyError,
    _req: Request,
    _res: Response,
  ): Promise<unknown> {
    return {
      message: err.message,
    };
  }
}
