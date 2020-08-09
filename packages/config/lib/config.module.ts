import { DynamicModule, Module } from '@uzert/core';
import { Config } from './config.provider';
import { IConfigLoader, IConfigOptions } from './interfaces';
import { ConfigStore } from './config.constants';

@Module({})
export class ConfigModule {
  static async for(
    options: IConfigOptions,
    configLoader?: IConfigLoader,
  ): Promise<DynamicModule> {
    const config = await Config.for(options, configLoader).useFactory();
    return {
      module: ConfigModule,
      exports: [Config, ConfigStore],
      providers: [
        {
          provide: Config,
          useValue: config,
        },
        {
          provide: ConfigStore,
          useValue: config.store,
        },
      ],
    };
  }
}
