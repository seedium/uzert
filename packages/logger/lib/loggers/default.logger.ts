import { FactoryProvider } from '@uzert/core';
import { AbstractLogger, LoggerOptionsBase } from '../interfaces';

export class DefaultLogger implements AbstractLogger {
  private readonly _isEnabled: boolean;
  static for(options?: LoggerOptionsBase): FactoryProvider {
    return {
      provide: DefaultLogger,
      useFactory: () => new DefaultLogger(options),
    };
  }
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
  public fatal(...args: unknown[]): void {
    this.call(console.error, ...args);
  }
  public error(...args: unknown[]): void {
    this.call(console.error, ...args);
  }
  public warn(...args: unknown[]): void {
    this.call(console.warn, ...args);
  }
  public info(...args: unknown[]): void {
    this.call(console.log, ...args);
  }
  public debug(...args: unknown[]): void {
    this.call(console.debug, ...args);
  }
  public trace(...args: unknown[]): void {
    this.call(console.trace, ...args);
  }
  public child(options?: LoggerOptionsBase): AbstractLogger {
    return new DefaultLogger(options);
  }
  private call(fn: (...args: unknown[]) => void, ...args) {
    if (this._isEnabled) {
      fn(...args);
    }
  }
}
