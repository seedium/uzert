import { LoggerOptions as PinoLoggerOptions } from 'pino';

export interface ILoggerOptions {
  pino?: PinoLoggerOptions;
}

export interface ILoggerMetadata {
  [key: string]: string;
}
