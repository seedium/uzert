import { ExtendedPinoOptions } from './pino-logger.interface';

export interface LoggerOptionsBase {
  enabled?: boolean;
}

export interface ILoggerOptions {
  default?: LoggerOptionsBase;
  pino?: ExtendedPinoOptions;
}

export interface AbstractLogger {
  fatal(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
  debug(...args: any[]): void;
  trace(...args: any[]): void;
  child(...args: any[]): AbstractLogger;
}
