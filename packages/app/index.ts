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

export * from './providers';
export * from './errors';
export * from './kernel';
export * from './interfaces';

// TODO remove when DI become available
import App from './providers/fastify-application.provider';

export default App;
