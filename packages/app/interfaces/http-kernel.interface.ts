import { IncomingMessage, Server, ServerResponse } from 'http';
import { Request, Response } from '../interfaces';
import { Plugin as FastifyPlugin } from 'fastify';

export type Plugin = FastifyPlugin<
  Server,
  IncomingMessage,
  ServerResponse,
  {
    [name: string]: any;
  }
>;

export interface IPluginKernel {
  plugin: Plugin;
  properties?: {
    [name: string]: any;
  };
}

export interface IHttpKernel {
  plugins: IPluginKernel[];
  middlewares: string[];
  notFoundHandler(req: Request, res: Response): any;
  errorHandler(err: Error, req: Request, res: Response): any;
}
