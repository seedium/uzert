import * as fastify from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import * as qs from 'qs';
import { merge, TraceMethodTime } from '@uzert/helpers';
import { HttpAdapter } from '@uzert/core';
// core providers
import { AbstractLogger } from '@uzert/logger';
import { DefaultLogger } from '@uzert/logger/loggers';
import { IPluginKernel, Request, Response } from '../interfaces';
import { FastifyHttpKernelAdapter } from './fastify-http-kernel.adapter';
// errors
import { FastifyHttpRouterAdapter } from './fastify-http-router.adapter';

const defaultLogger = new DefaultLogger();

export class FastifyAdapter extends HttpAdapter<fastify.FastifyInstance, Request, Response> {
  protected _router = new FastifyHttpRouterAdapter();
  protected _kernel = new FastifyHttpKernelAdapter();
  protected _app?: fastify.FastifyInstance;
  protected _isReady: boolean = false;

  get app(): fastify.FastifyInstance {
    return this._app;
  }
  get isReady(): boolean {
    return this._isReady;
  }
  constructor(options: fastify.ServerOptions = {}, private readonly _logger: AbstractLogger = defaultLogger) {
    super();

    this._app = fastify(this.buildOptions(options));
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
  public async run(): Promise<fastify.FastifyInstance> {
    if (this.isReady) {
      return this._app;
    }

    this.bootKernel();
    this.bootRouter();
    await this._app.ready();
    this._isReady = true;

    return this._app;
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

  @TraceMethodTime({
    logger: defaultLogger.info.bind(defaultLogger),
    printStartMessage: () => `Start initialization Router...`,
    printFinishMessage: ({ time }) => `Successfully initialization Router: ${time}ms`,
  })
  protected bootRouter() {
    // await Route.initRoutes(this._app);
  }
  protected applyPlugin(plugin: IPluginKernel) {
    this._app.register(plugin.plugin, plugin.options);
  }
  protected buildOptions(options: fastify.ServerOptions) {
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
