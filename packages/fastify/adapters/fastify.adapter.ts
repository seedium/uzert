import fastify, { RegisterOptions } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import * as qs from 'qs';
import { isFunction, merge, TraceMethodTime } from '@uzert/helpers';
import { HttpAdapter, UzertContainer } from '@uzert/core';
// core providers
import { AbstractLogger, DefaultLogger } from '@uzert/logger';
import {
  IPluginKernel,
  Request,
  Response,
  FastifyInstance,
  Http2Server,
  FastifyHttp2Options,
  RegisterRouterCallback,
} from '../interfaces';
import { FastifyHttpKernelAdapter } from './fastify-http-kernel.adapter';
import { Router } from '../router';

const defaultLogger = new DefaultLogger();

export class FastifyAdapter extends HttpAdapter<
  FastifyInstance,
  Request,
  Response
> {
  protected _kernel = new FastifyHttpKernelAdapter();
  protected _app?: FastifyInstance;
  protected _isReady = false;

  get app(): FastifyInstance {
    return this._app;
  }
  get isReady(): boolean {
    return this._isReady;
  }
  constructor(
    options: FastifyHttp2Options = { http2: true },
    private readonly _logger: AbstractLogger = defaultLogger,
  ) {
    super();

    this._app = fastify<Http2Server>(this.buildOptions(options));
  }

  public async listen(port = 3000, address = '0.0.0.0'): Promise<string> {
    return this.app.listen(port, address);
  }
  public async onDispose(): Promise<void> {
    await this.app.close();
  }

  @TraceMethodTime({
    logger: defaultLogger.info.bind(defaultLogger),
    printStartMessage: () => `Start application...`,
    printFinishMessage: ({ time }) =>
      `Application successfully initialized: ${time}ms`,
  })
  public async run(): Promise<FastifyInstance> {
    if (this.isReady) {
      return this._app;
    }

    this.bootKernel();
    await this._app.ready();
    this._isReady = true;

    return this._app;
  }
  public registerRouter(
    container: UzertContainer,
    cb: RegisterRouterCallback,
    options?: RegisterOptions,
  ): void {
    if (!isFunction(cb)) {
      throw new Error(
        'Your should register routes via passed Router to the function',
      );
    }
    this._app.register(async (app) => {
      const router = new Router(container, app);
      await cb(router, app);
    }, options);
  }
  @TraceMethodTime({
    logger: defaultLogger.info.bind(defaultLogger),
    printStartMessage: () => `Start initialization Kernel...`,
    printFinishMessage: ({ time }) =>
      `Successfully initialization Kernel: ${time}ms`,
  })
  protected bootKernel(): void {
    // init users plugins
    this._kernel.plugins.forEach((plugin: IPluginKernel) =>
      this.applyPlugin(plugin),
    );
    // set handlers
    this._app.setNotFoundHandler(this._kernel.notFoundHandler);
    this._app.setErrorHandler(this._kernel.errorHandler);
  }

  protected applyPlugin(plugin: IPluginKernel): void {
    this._app.register(plugin.plugin, plugin.options);
  }
  protected buildOptions(options: FastifyHttp2Options): FastifyHttp2Options {
    return merge<FastifyHttp2Options>(
      {
        logger: this._logger,
        genReqId: this.generateRequestId,
        querystringParser: this.parseQueryString,
        http2: true,
      },
      options,
    );
  }
  protected generateRequestId(): string {
    return uuidv4();
  }
  protected parseQueryString(
    str: string,
  ): { [key: string]: string | string[] } {
    return qs.parse(str) as { [key: string]: string | string[] };
  }
}
