import { ExtendedPinoOptions } from './pino-logger.interface';

export interface LoggerOptionsBase {
  enabled?: boolean;
}

export interface ILoggerOptions {
  default?: LoggerOptionsBase;
  pino?: ExtendedPinoOptions;
}

export interface AbstractLogger {
  fatal(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  trace(...args: unknown[]): void;
  child(...args: unknown[]): AbstractLogger;
}
