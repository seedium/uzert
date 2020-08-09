import {
  HTTPMethods,
  RouteShorthandOptions,
  preHandlerHookHandler,
  RawServerBase,
} from 'fastify';
import {
  Controller,
  CustomProvider,
  Pipe,
  Provider,
  Type,
  UzertContainer,
} from '@uzert/core';
import {
  ROUTER_INSTANCE,
  ROUTER_OPTIONS,
  PIPES_METADATA,
} from '@uzert/core/constants';
import { ContainerScanner } from '@uzert/core/injector/container-scanner';
import { isNil } from '@uzert/helpers';
import { PluginFastifyInstance, RouteHandler } from '../interfaces';

export class Router {
  private readonly _containerScanner: ContainerScanner;
  constructor(
    private readonly _container: UzertContainer,
    private readonly _app: PluginFastifyInstance,
  ) {
    this._containerScanner = new ContainerScanner(_container);
  }
  public post(path: string, handler: RouteHandler): void {
    this.route(path, 'POST', handler);
  }
  public get(path: string, handler: RouteHandler): void {
    this.route(path, 'GET', handler);
  }
  public put(path: string, handler: RouteHandler): void {
    this.route(path, 'PUT', handler);
  }
  public delete(path: string, handler: RouteHandler): void {
    this.route(path, 'DELETE', handler);
  }
  public patch(path: string, handler: RouteHandler): void {
    this.route(path, 'PATCH', handler);
  }
  public head(path: string, handler: RouteHandler): void {
    this.route(path, 'HEAD', handler);
  }
  protected route(
    path: string,
    method: HTTPMethods,
    handler: RouteHandler,
  ): void {
    const instance = this.reflectInstance(handler);
    const routerOptions = this.exploreMethod(handler);
    this._app.route({
      ...routerOptions,
      method,
      url: path,
      handler: this.bindMethod<RouteHandler>(handler, instance),
    });
  }
  protected exploreMethod(
    handler: RouteHandler,
  ): RouteShorthandOptions<RawServerBase> {
    const pipes = this.resolvePipes(handler);
    const options = this.reflectRouterOptions(handler);
    return {
      ...options,
      preHandler: this.applyHandlers(pipes, options.preHandler),
    };
  }
  protected resolvePipes(handler: RouteHandler): Pipe[] {
    const pipesMetadata = this.reflectPipes(handler);
    return pipesMetadata.map((pipe) =>
      this.findInjectablesPerMethodContext(pipe, handler),
    );
  }
  protected reflectInstance(handler: RouteHandler): Controller {
    const instance = Reflect.getMetadata(ROUTER_INSTANCE, handler);
    if (!instance) {
      throw new Error(
        'Invalid controller method. Did you set decorator "@Controller" to the class method?',
      );
    }
    return this._containerScanner.find(instance.constructor.name);
  }
  protected reflectPipes(handler: RouteHandler): Type<Pipe>[] {
    return Reflect.getMetadata(PIPES_METADATA, handler) || [];
  }
  protected reflectRouterOptions(
    handler: RouteHandler,
  ): RouteShorthandOptions<RawServerBase> {
    return Reflect.getMetadata(ROUTER_OPTIONS, handler) || {};
  }
  protected applyHandlers(
    pipes: Pipe[],
    preHandlers:
      | preHandlerHookHandler<RawServerBase>[]
      | preHandlerHookHandler<RawServerBase> = [],
  ): preHandlerHookHandler<RawServerBase>[] {
    const pipesHandlers = this.getPipesHandlers(pipes);
    if (Array.isArray(preHandlers)) {
      return [...pipesHandlers, ...preHandlers];
    } else {
      return [...pipesHandlers, preHandlers];
    }
  }
  protected getPipesHandlers(
    pipes: Pipe[],
  ): preHandlerHookHandler<RawServerBase>[] {
    return pipes.map((pipe) => this.bindMethod(pipe.use, pipe));
  }
  protected findInjectablesPerMethodContext(
    pipe: Provider,
    handler: Function,
  ): Pipe {
    if (this.isCustomProvider(pipe)) {
      return this._containerScanner.findInjectablesPerMethodContext(
        pipe.provide,
        handler,
      );
    } else {
      return this._containerScanner.findInjectablesPerMethodContext(
        pipe,
        handler,
      );
    }
  }
  protected bindMethod<T extends Function>(
    handler: Function,
    instance: Controller,
  ): T {
    return handler.bind(instance);
  }
  private isCustomProvider(provider: Provider): provider is CustomProvider {
    return !isNil((provider as CustomProvider).provide);
  }
}
