import { OnDispose, OnAppShutdown } from '@uzert/core';
import { ILoggerOptions } from '../interfaces';
import { PinoLogger, DefaultLogger } from '../loggers';

export class Logger implements OnDispose, OnAppShutdown {
  protected _default?: DefaultLogger;
  protected _pino?: PinoLogger;

  static boot(options?: ILoggerOptions) {
    return {
      provide: Logger,
      useFactory: () => new Logger(options),
    };
  }
  get default() {
    return this._default;
  }
  get pino() {
    if (!this._pino) {
      throw new Error('Pino instance is not initialized yet. Did you include logger to boot service?');
    }
    return this._pino;
  }
  constructor(options?: ILoggerOptions) {
    this._default = new DefaultLogger(options?.default);
    if (options?.pino?.enabled) {
      this._pino = new PinoLogger(options.pino);
    }
  }
  public onAppShutdown(err: Error | null, signal?: string): any {
    this.pino._finalLogger(err, signal);
  }
  public onDispose(): void {
    this._default = undefined;
    if (this._pino) {
      this._pino = undefined;
    }
  }
}
