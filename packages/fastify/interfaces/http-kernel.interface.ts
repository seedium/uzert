import { FastifyPlugin } from 'fastify';

export interface IPluginKernel {
  plugin: FastifyPlugin;
  options?: {
    [name: string]: any;
  };
}
