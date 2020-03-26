// export default fastify and http types
export {
  FastifyInstance as IApplication,
  Plugin as FastifyPlugin,
  FastifyReply,
  FastifyRequest,
  DefaultQuery,
  DefaultParams,
  DefaultHeaders,
  DefaultBody,
  Middleware,
  HTTPMethod,
  FastifyError,
  RouteSchema,
} from 'fastify';

// import external types
import { IncomingMessage, Server, ServerResponse } from 'http';
import {
  FastifyInstance as Application,
  FastifyReply,
  FastifyRequest,
  Plugin as FastifyPlugin,
  DefaultQuery,
  DefaultParams,
  DefaultHeaders,
  DefaultBody,
} from 'fastify';

// import own types
export type Response = FastifyReply<ServerResponse>;
export type Request<T = DefaultQuery, U = DefaultParams, Z = DefaultHeaders, Y = DefaultBody> = FastifyRequest<
  IncomingMessage,
  T,
  U,
  Z,
  Y
>;
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

export { default } from './Application';
export { default as HttpKernel } from './Kernel/HttpKernel';
