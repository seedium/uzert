import { ProviderInstance } from '@uzert/core';
import { Logger as PinoLogger } from 'pino';
import { ILoggerOptions } from '../interfaces';
import { createPino } from '../loggers';

export class Logger extends ProviderInstance {
  protected _pino?: PinoLogger;

  static boot(options: ILoggerOptions) {
    return {
      provide: Logger,
      useFactory: () => new Logger(options),
    };
  }
  get pino() {
    if (!this._pino) {
      throw new Error('Pino instance is not initialized yet. Did you include logger to boot service?');
    }

    return this._pino;
  }
  set pino(instance: PinoLogger) {
    this._pino = instance;
  }
  constructor({ pino: pinoOptions }: ILoggerOptions) {
    super();
    this.pino = createPino(pinoOptions);
  }
  public dispose(): void {
    if (this._pino) {
      this._pino = undefined;
    }
  }
}
