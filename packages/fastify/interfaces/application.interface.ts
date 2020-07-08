import {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerBase,
  RouteHandlerMethod,
} from 'fastify';

export type Response = FastifyReply;
export type Request = FastifyRequest;
export type PluginFastifyInstance = FastifyInstance<
  RawServerBase,
  RawRequestDefaultExpression<RawServerBase>,
  RawReplyDefaultExpression<RawServerBase>
>;
export type RouteHandler = RouteHandlerMethod<RawServerBase>;
