import * as fastify from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import * as qs from 'qs';
import { IncomingMessage } from 'http';
import { merge } from '@uzert/helpers';
// core providers
import { HttpAdapter } from '../../core/adapters';
import Logger from '@uzert/logger';
import Config from '@uzert/config';
import { Route, Middleware } from '@uzert/http';
import { IPluginKernel } from '../interfaces';
import { HttpKernelAdapter, DefaultHttpKernel } from '../kernel';
// errors
import { AppBootError } from '../errors';

export class FastifyApplicationProvider extends HttpAdapter<fastify.FastifyInstance> {
  // Fastify instance
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

  public async boot(options: fastify.ServerOptions) {
    options = merge(
      {
        logger: Logger.pino,
        ignoreTrailingSlash: Config.get('server:ignoreTrailingSlash', true),
        maxParamLength: Config.get('server:maxParamLength', 100),
        bodyLimit: Config.get('server:bodyLimit', 1048576),
        caseSensitive: Config.get('server:caseSensitive', true),
        trustProxy: Config.get('server:trustProxy', false),
        pluginTimeout: Config.get('server:pluginTimeout', 0),
        genReqId: () => uuidv4(),
        querystringParser: (str) => qs.parse(str),
      },
      options,
    );

    const startTime = new Date().getTime();

    // register logger and other settings from config in fastify application
    this._app = fastify(options);

    this._app.addContentTypeParser(Config.get('filesystems:supportMimes') || [], async (req: IncomingMessage) => {
      Logger.pino.debug(`Uploading binary data with size - ${req.headers['content-length']}`);
    });

    await this.bootKernel(kernel);
    await this.bootRouter();

    const finishTime = new Date().getTime();
    Logger.pino.trace(`Successfully initialization Application: ${finishTime - startTime}ms`);
  }

  public async unBoot() {
    if (this._app) {
      await this._app.close();
    }
  }

  public async run(): Promise<fastify.FastifyInstance> {
    if (!this._app) {
      throw new AppBootError();
    }

    if (this.isReady) {
      return this._app;
    }

    await this._app.ready();
    this.isReady = true;

    return this._app;
  }

  protected async bootKernel(kernel: HttpKernelAdapter) {
    const startTime = new Date().getTime();

    if (!this._app) {
      throw new AppBootError();
    }

    // init users plugins
    kernel.plugins.forEach((plugin: IPluginKernel) => this.applyPlugin(plugin));

    // init users middlewars
    await Promise.all(kernel.middlewares.map((middleware: string) => this.applyMiddleware(middleware)));

    // set handlers
    this._app.setNotFoundHandler(kernel.notFoundHandler);
    this._app.setErrorHandler(kernel.errorHandler);

    const finishTime = new Date().getTime();
    Logger.pino.trace(`Successfully initialization Kernel: ${finishTime - startTime}ms`);
  }

  protected async bootRouter() {
    const startTime = new Date().getTime();

    if (!this._app) {
      throw new AppBootError();
    }

    await Route.initRoutes(this._app);
    const finishTime = new Date().getTime();
    Logger.pino.trace(`Successfully initialization Controllers: ${finishTime - startTime}ms`);
  }

  protected async applyMiddleware(middleware: string) {
    if (!this._app) {
      throw new AppBootError();
    }

    this._app.use(await Middleware.loadMiddleware(middleware));
  }

  protected applyPlugin(plugin: IPluginKernel) {
    if (!this._app) {
      throw new AppBootError();
    }

    this._app.register(plugin.plugin, plugin.properties);
  }
}
