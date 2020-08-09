import { FactoryProvider } from '@uzert/core';
import { ILoggerOptions } from './interfaces';
import { PinoLogger, DefaultLogger } from './loggers';

export const createLoggerProviders = (
  options?: ILoggerOptions,
): FactoryProvider[] => {
  const providers: FactoryProvider[] = [];
  if (options?.default?.enabled) {
    providers.push(DefaultLogger.for(options.default));
  }
  if (options?.pino?.enabled) {
    providers.push(PinoLogger.for(options.pino));
  }
  return providers;
};
