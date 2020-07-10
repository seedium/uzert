import * as pino from 'pino';
import { ProviderInstance } from '@uzert/core';
import { ExtendedPinoOptions, AbstractLogger, PinoEventHandler } from '../interfaces';

export class PinoLogger extends ProviderInstance implements AbstractLogger {
  private readonly _logger: pino.Logger;
  private readonly _finalLogger: PinoEventHandler;
  constructor(options?: ExtendedPinoOptions) {
    super();
    if (options?.extremeMode?.enabled) {
      const extremeModeTick = options?.extremeMode?.tick || 10000;
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
  public dispose(event: string, err?): Promise<void> | void {
    this._finalLogger(err, event);
  }
  public fatal(obj: object, msg?: string, ...args: any[]): void;
  public fatal(msg: string, ...args: any[]): void;
  public fatal(msgOrObject: any, ...args: any[]): void {
    this._logger.fatal(msgOrObject, ...args);
  }
  public error(obj: object, msg?: string, ...args: any[]): void;
  public error(msg: string, ...args: any[]): void;
  public error(msgOrObject: any, ...args: any[]): void {
    this._logger.error(msgOrObject, ...args);
  }
  public warn(obj: object, msg?: string, ...args: any[]): void;
  public warn(msg: string, ...args: any[]): void;
  public warn(msgOrObject: any, ...args: any[]): void {
    this._logger.warn(msgOrObject, ...args);
  }
  public info(obj: object, msg?: string, ...args: any[]): void;
  public info(msg: string, ...args: any[]): void;
  public info(msgOrObject: any, ...args: any[]): void {
    this._logger.info(msgOrObject, ...args);
  }
  public debug(obj: object, msg?: string, ...args: any[]): void;
  public debug(msg: string, ...args: any[]): void;
  public debug(msgOrObject: any, ...args: any[]): void {
    this._logger.debug(msgOrObject, ...args);
  }
  public trace(obj: object, msg?: string, ...args: any[]): void;
  public trace(msg: string, ...args: any[]): void;
  public trace(msgOrObject: any, ...args: any[]): void {
    this._logger.trace(msgOrObject, ...args);
  }
  public child(bindings: pino.Bindings): AbstractLogger {
    return this._logger.child(bindings);
  }
  protected flushLogger(tick: number): void {
    setInterval(() => {
      this._logger.flush();
    }, tick).unref();
  }
  protected finalHandler(err: Error | null, finalLogger: pino.Logger, evt: string) {
    finalLogger.info(`${evt} caught`);

    if (err) {
      finalLogger.error(err, 'error caused exit');
    }
  }
}
