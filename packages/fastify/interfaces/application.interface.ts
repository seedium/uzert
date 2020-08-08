import * as http2 from 'http2';
import {
  FastifyInstance as FastifyInstanceBase,
  FastifyReply,
  FastifyRequest,
  FastifyServerOptions,
  RouteHandlerMethod,
} from 'fastify';
import { FastifyLoggerInstance } from 'fastify/types/logger';
import { AbstractLogger } from '@uzert/logger';
import { Router } from '../router';

export type Http2Server = http2.Http2Server;

export type FastifyHttp2Options<
  Server extends Http2Server = Http2Server,
  Logger extends FastifyLoggerInstance = AbstractLogger
> = FastifyServerOptions<Server, Logger> & {
  http2: true;
  http2SessionTimeout?: number;
};

export type FastifyInstance = FastifyInstanceBase<Http2Server>;
export type Response = FastifyReply<Http2Server>;
export type Request = FastifyRequest<undefined, Http2Server>;
export type PluginFastifyInstance = FastifyInstanceBase;
export type RouteHandler = RouteHandlerMethod;

export type RegisterRouterCallback = (
  router: Router,
  app: PluginFastifyInstance,
) => Promise<void> | void;
