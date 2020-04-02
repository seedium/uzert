import * as fastify from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import * as qs from 'qs';
import { merge, TraceMethodTime } from '@uzert/helpers';
import { HttpAdapter } from '@uzert/core';
// core providers
import { Logger } from '@uzert/logger';
import { Config } from '@uzert/config';
import { IPluginKernel } from '../interfaces';
import { FastifyHttpKernelAdapter } from './fastify-http-kernel.adapter';
// errors
import { AppBootError } from '../errors';
import { FastifyHttpRouterAdapter } from './fastify-http-router.adapter';

export class FastifyAdapter extends HttpAdapter<fastify.FastifyInstance> {
  protected _router = new FastifyHttpRouterAdapter();
  protected _kernel = new FastifyHttpKernelAdapter();
  protected _app?: fastify.FastifyInstance;
  protected _isReady: boolean = false;

  get app(): fastify.FastifyInstance {
    if (!this._app) {
      throw new AppBootError();
    }

    return this._app;
  }

  set isReady(value: boolean) {
    this._isReady = value;
  }

  get isReady(): boolean {
    if (!this._app) {
      throw new AppBootError();
    }

    return this._isReady;
  }

  constructor(private readonly _logger: Logger, private readonly _config: Config) {
    super();
    const optionsFromConfig = this._config.get('server', {});

    const options = merge(
      {
        logger: this._logger.pino,
        genReqId: () => uuidv4(),
        querystringParser: (str) => qs.parse(str),
      },
      optionsFromConfig,
    );

    this._app = fastify(options);
  }

  public async listen() {
    return this.app.listen(this._config.get('server:port'), this._config.get('server:address'));
  }
  public async dispose() {
    await this.app.close();
  }

  @TraceMethodTime({
    startMessage: `Start initialization fastify adapter...`,
    finishMessage: `Successfully initialization fastify adapter: %s ms`,
  })
  public async run(): Promise<fastify.FastifyInstance> {
    if (!this._app) {
      throw new AppBootError();
    }

    if (this.isReady) {
      return this._app;
    }

    this.bootKernel();
    this.bootRouter();
    await this._app.ready();
    this.isReady = true;

    return this._app;
  }

  @TraceMethodTime({
    startMessage: `Start initialization Kernel...`,
    finishMessage: `Successfully initialization Kernel: %s ms`,
  })
  public bootKernel() {
    if (!this._app) {
      throw new AppBootError();
    }
    // init users plugins
    this._kernel.plugins.forEach((plugin: IPluginKernel) => this.applyPlugin(plugin));
    // set handlers
    this._app.setNotFoundHandler(this._kernel.notFoundHandler);
    this._app.setErrorHandler(this._kernel.errorHandler);
  }

  @TraceMethodTime({
    startMessage: `Start initialization Router...`,
    finishMessage: `Successfully initialization Router: %s ms`,
  })
  public bootRouter() {
    if (!this._app) {
      throw new AppBootError();
    }
    // await Route.initRoutes(this._app);
  }

  protected applyPlugin(plugin: IPluginKernel) {
    if (!this._app) {
      throw new AppBootError();
    }

    this._app.register(plugin.plugin, plugin.options);
  }
}
