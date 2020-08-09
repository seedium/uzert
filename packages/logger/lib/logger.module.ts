import { DynamicModule, Module } from '@uzert/core';
import { ILoggerOptions } from './interfaces';
import { createLoggerProviders } from './logger.provider';

@Module({})
export class LoggerModule {
  static for(options?: ILoggerOptions): DynamicModule {
    const providers = createLoggerProviders(options);

    return {
      module: LoggerModule,
      providers,
      exports: providers.map((provider) => provider.provide),
    };
  }
}
