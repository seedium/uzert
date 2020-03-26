import { IncomingMessage, ServerResponse } from 'http';
import {
  FastifyReply,
  FastifyRequest,
  DefaultQuery,
  DefaultParams,
  DefaultHeaders,
  DefaultBody,
} from 'fastify';

export type Response = FastifyReply<ServerResponse>;
export type Request<T = DefaultQuery, U = DefaultParams, Z = DefaultHeaders, Y = DefaultBody> = FastifyRequest<
  IncomingMessage,
  T,
  U,
  Z,
  Y
  >;
