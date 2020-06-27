import * as pino from 'pino';
import { ExtendedPinoOptions, AbstractLogger } from '../interfaces';

export class PinoLogger implements AbstractLogger {
  private readonly _logger: pino.Logger;
  constructor(options: ExtendedPinoOptions) {
    if (options?.extremeMode?.enabled) {
      const extremeModeTick = options?.extremeMode?.tick || 10000;
      this._logger = pino(options, pino.extreme());
      this._logger.info('Pino extreme mode is enabled');

      setInterval(() => {
        this._logger.flush();
      }, extremeModeTick).unref();

      const handler = pino.final(this._logger, (err, finalLogger, evt) => {
        finalLogger.info(`${evt} caught`);

        if (err) {
          finalLogger.error(err, 'error caused exit');
        }

        process.exit(err ? 1 : 0);
      });

      process.on('beforeExit', () => handler(null, 'beforeExit'));
      process.on('exit', () => handler(null, 'exit'));
      process.on('uncaughtException', (err) => handler(err, 'uncaughtException'));
      process.on('SIGINT', () => handler(null, 'SIGINT'));
      process.on('SIGQUIT', () => handler(null, 'SIGQUIT'));
      process.on('SIGTERM', () => handler(null, 'SIGTERM'));
    } else {
      this._logger = pino(options);
    }
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
}
