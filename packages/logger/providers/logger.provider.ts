import { IProvider } from '@uzert/core';
import { Logger as PinoLogger } from 'pino';
import { ILoggerMetadata, ILoggerOptions } from '../interfaces';
import { createPino } from '../loggers';

export class LoggerProvider implements IProvider {
  protected _pino?: PinoLogger;

  get pino() {
    if (!this._pino) {
      throw new Error('Pino instance is not initialized yet. Did you include logger to boot service?');
    }

    return this._pino;
  }

  set pino(instance) {
    this._pino = instance;
  }

  public boot({ pino: pinoOptions }: ILoggerOptions = {}, metadata?: ILoggerMetadata) {
    this.pino = createPino(pinoOptions, metadata);
  }

  public unBoot(): void {
    if (this._pino) {
      this._pino = undefined;
    }
  }
}

export default new LoggerProvider();
