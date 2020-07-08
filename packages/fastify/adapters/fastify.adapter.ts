import fastify, { FastifyServerOptions, FastifyInstance, RegisterOptions, RawServerDefault } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import * as qs from 'qs';
import { isFunction, merge, TraceMethodTime } from '@uzert/helpers';
import { HttpAdapter, UzertContainer } from '@uzert/core';
// core providers
import { AbstractLogger } from '@uzert/logger';
import { DefaultLogger } from '@uzert/logger/loggers';
import { IPluginKernel, Request, Response, PluginFastifyInstance } from '../interfaces';
import { FastifyHttpKernelAdapter } from './fastify-http-kernel.adapter';
import { Router } from '../router';

const defaultLogger = new DefaultLogger();

export class FastifyAdapter extends HttpAdapter<FastifyInstance, Request, Response> {
  protected _kernel = new FastifyHttpKernelAdapter();
  protected _app?: FastifyInstance;
  protected _isReady: boolean = false;

  get app(): FastifyInstance {
    return this._app;
  }
  get isReady(): boolean {
    return this._isReady;
  }
  constructor(options: FastifyServerOptions = {}, private readonly _logger: AbstractLogger = defaultLogger) {
    super();

    this._app = fastify<RawServerDefault>(this.buildOptions(options));
  }

  public async listen(port: number, address: string) {
    return this.app.listen(port, address);
  }
  public async dispose() {
    await this.app.close();
  }

  @TraceMethodTime({
    logger: defaultLogger.info.bind(defaultLogger),
    printStartMessage: () => `Start application...`,
    printFinishMessage: ({ time }) => `Application successfully initialized: ${time}ms`,
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
  public async registerRouter(
    container: UzertContainer,
    cb: (router: Router, app: PluginFastifyInstance) => Promise<void> | void,
    options: RegisterOptions,
  ) {
    if (!isFunction(cb)) {
      throw new Error('Your register router method should return callback for registering in fastify');
    }
    this._app.register(async (app, options, next) => {
      const router = new Router(container, app);
      try {
        await cb(router, app);
      } catch (e) {
        return next(e);
      }
      next();
    }, options);
  }
  @TraceMethodTime({
    logger: defaultLogger.info.bind(defaultLogger),
    printStartMessage: () => `Start initialization Kernel...`,
    printFinishMessage: ({ time }) => `Successfully initialization Kernel: ${time}ms`,
  })
  protected bootKernel() {
    // init users plugins
    this._kernel.plugins.forEach((plugin: IPluginKernel) => this.applyPlugin(plugin));
    // set handlers
    this._app.setNotFoundHandler(this._kernel.notFoundHandler);
    this._app.setErrorHandler(this._kernel.errorHandler);
  }

  protected applyPlugin(plugin: IPluginKernel) {
    this._app.register(plugin.plugin, plugin.options);
  }
  protected buildOptions(options: FastifyServerOptions) {
    return merge(
      {
        logger: this._logger,
        genReqId: this.generateRequestId,
        querystringParser: this.parseQueryString,
      },
      options,
    );
  }
  protected generateRequestId() {
    return uuidv4();
  }
  protected parseQueryString(str: string) {
    return qs.parse(str);
  }
}
