import { Logger as PinoLogger } from 'pino';
import { IProvider } from '@uzert/core';
import { ILoggerMetadata, ILoggerOptions } from './types';
import createPino from './loggers/pino';

export class Logger implements IProvider {
  protected _pino?: PinoLogger;

  get pino() {
    if (!this._pino) {
      throw new Error('Pino instance is not initialized yet. Did you include logger to boot service?');
    }

    return this._pino;
  }

  set pino(instance) {
    if (this._pino) {
      throw new Error('Pino logger is already initialized. Did you include logger in boot service twice?');
    }

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

export default new Logger();
