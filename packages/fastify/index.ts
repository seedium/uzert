import 'reflect-metadata';

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

export * from './adapters';
export * from './errors';
export * from './interfaces';
