import * as pino from 'pino';
import { FactoryProvider, OnAppShutdown, OnDispose } from '@uzert/core';
import {
  ExtendedPinoOptions,
  AbstractLogger,
  PinoEventHandler,
} from '../interfaces';

export class PinoLogger implements AbstractLogger, OnAppShutdown, OnDispose {
  private readonly _finalLogger: PinoEventHandler;
  private _logger: pino.Logger;
  static for(options?: ExtendedPinoOptions): FactoryProvider {
    return {
      provide: PinoLogger,
      useFactory: () => new PinoLogger(options),
    };
  }
  constructor(options?: ExtendedPinoOptions) {
    if (options?.extremeMode?.enabled) {
      const extremeModeTick = options.extremeMode.tick || 10000;
      this._logger = pino(
        options,
        pino.destination({
          sync: false,
          minLength: 4096,
        }),
      );
      this._logger.info('Pino extreme mode is enabled');
      this.flushLogger(extremeModeTick);
      this._finalLogger = pino.final(this._logger, this.finalHandler);
    } else {
      this._logger = pino(options);
    }
  }
  public fatal(obj: object, msg?: string, ...args: unknown[]): void;
  public fatal(msg: string, ...args: unknown[]): void;
  // eslint-disable-next-line
  public fatal(msgOrObject: any, ...args: unknown[]): void {
    this._logger.fatal(msgOrObject, ...args);
  }
  public error(obj: object, msg?: string, ...args: unknown[]): void;
  public error(msg: string, ...args: unknown[]): void;
  // eslint-disable-next-line
  public error(msgOrObject: any, ...args: unknown[]): void {
    this._logger.error(msgOrObject, ...args);
  }
  public warn(obj: object, msg?: string, ...args: unknown[]): void;
  public warn(msg: string, ...args: unknown[]): void;
  // eslint-disable-next-line
  public warn(msgOrObject: any, ...args: unknown[]): void {
    this._logger.warn(msgOrObject, ...args);
  }
  public info(obj: object, msg?: string, ...args: unknown[]): void;
  public info(msg: string, ...args: unknown[]): void;
  // eslint-disable-next-line
  public info(msgOrObject: any, ...args: unknown[]): void {
    this._logger.info(msgOrObject, ...args);
  }
  public debug(obj: object, msg?: string, ...args: unknown[]): void;
  public debug(msg: string, ...args: unknown[]): void;
  // eslint-disable-next-line
  public debug(msgOrObject: any, ...args: unknown[]): void {
    this._logger.debug(msgOrObject, ...args);
  }
  public trace(obj: object, msg?: string, ...args: unknown[]): void;
  public trace(msg: string, ...args: unknown[]): void;
  // eslint-disable-next-line
  public trace(msgOrObject: any, ...args: unknown[]): void {
    this._logger.trace(msgOrObject, ...args);
  }
  public child(bindings?: pino.Bindings): AbstractLogger {
    return this._logger.child(bindings);
  }
  public onAppShutdown(err: Error | null, signal?: string): void {
    this._finalLogger(err, signal);
  }
  public onDispose(): void {
    this._logger = undefined;
  }
  private flushLogger(tick: number): void {
    setInterval(() => {
      this._logger.flush();
    }, tick).unref();
  }
  private finalHandler(
    err: Error | null,
    finalLogger: pino.Logger,
    evt: string,
  ): void {
    finalLogger.info(`${evt} caught`);

    if (err) {
      finalLogger.error(err, 'error caused exit');
    }
  }
}
