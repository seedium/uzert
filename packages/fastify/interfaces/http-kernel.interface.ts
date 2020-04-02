import { IncomingMessage, Server, ServerResponse } from 'http';
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
  options?: {
    [name: string]: any;
  };
}
