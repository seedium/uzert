import { AbstractLogger, LoggerOptionsBase } from '../interfaces';

export class DefaultLogger implements AbstractLogger {
  private readonly _isEnabled: boolean;
  constructor(options?: LoggerOptionsBase) {
    const isDisabledFromEnv = process.env.UZERT_LOGGER_ENABLED === 'false';
    if (isDisabledFromEnv) {
      this._isEnabled = false;
    } else if (options?.enabled !== undefined && options.enabled !== null) {
      this._isEnabled = options.enabled;
    } else {
      this._isEnabled = true;
    }
  }
  public fatal(...args): void {
    this.call(console.error, ...args);
  }
  public error(...args): void {
    this.call(console.error, ...args);
  }
  public warn(...args): void {
    this.call(console.warn, ...args);
  }
  public info(...args): void {
    this.call(console.log, ...args);
  }
  public debug(...args): void {
    this.call(console.debug, ...args);
  }
  public trace(...args): void {
    this.call(console.trace, ...args);
  }
  private call(fn: (...args: any) => void, ...args) {
    if (this._isEnabled) {
      fn(...args);
    }
  }
}
