import * as fastify from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import * as qs from 'qs';
import HttpKernel from '../../kernel/HttpKernel';
import DefaultHttpKernel from '../../kernel/DefaultHttpKernel';
// types
import { IncomingMessage } from 'http';
import { IPluginKernel, IApplication } from '../index';
// core providers
import { IProvider } from '@uzert/core';
import Logger from '@uzert/logger';
import Config from '@uzert/config';
import { Route, Middleware } from '@uzert/http';
// errors
import AppBootErrorError from '../../errors/AppBootError';

class FastifyApplicationProvider implements IProvider {
  // Fastify instance
  protected _app?: IApplication;

  get app(): IApplication {
    if (!this._app) {
      throw new AppBootErrorError();
    }

    return this._app;
  }

  get isReady(): boolean {
    if (!this._app) {
      throw new AppBootErrorError();
    }

    return !!this._app.isReady;
  }

  public async boot(kernel?: HttpKernel) {
    const startTime = new Date().getTime();

    if (!kernel) {
      kernel = new DefaultHttpKernel();
    }

    // register logger and other settings from config in fastify application
    this._app = fastify({
      logger: Logger.pino,
      ignoreTrailingSlash: Config.get('server:ignoreTrailingSlash', true),
      maxParamLength: Config.get('server:maxParamLength', 100),
      bodyLimit: Config.get('server:bodyLimit', 1048576),
      caseSensitive: Config.get('server:caseSensitive', true),
      trustProxy: Config.get('server:trustProxy', false),
      pluginTimeout: Config.get('server:pluginTimeout', 0),
      genReqId: () => uuidv4(),
      querystringParser: (str) => qs.parse(str),
    });
    this._app.isReady = false;

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

  public async run(): Promise<IApplication> {
    if (!this._app) {
      throw new AppBootErrorError();
    }

    if (this._app.isReady) {
      return this._app;
    }

    await this._app.ready();
    this._app.isReady = true;

    return this._app;
  }

  protected async bootKernel(kernel: HttpKernel) {
    const startTime = new Date().getTime();

    if (!this._app) {
      throw new AppBootErrorError();
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
      throw new AppBootErrorError();
    }

    await Route.initRoutes(this._app);
    const finishTime = new Date().getTime();
    Logger.pino.trace(`Successfully initialization Controllers: ${finishTime - startTime}ms`);
  }

  protected async applyMiddleware(middleware: string) {
    if (!this._app) {
      throw new AppBootErrorError();
    }

    this._app.use(await Middleware.loadMiddleware(middleware));
  }

  protected applyPlugin(plugin: IPluginKernel) {
    if (!this._app) {
      throw new AppBootErrorError();
    }

    this._app.register(plugin.plugin, plugin.properties);
  }
}

export default new FastifyApplicationProvider();
