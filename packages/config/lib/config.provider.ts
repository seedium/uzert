import { FactoryProvider, OnDispose } from '@uzert/core';
import { isUndefined, prop, merge } from '@uzert/helpers';
import { ConfigLoader } from './loaders';
import { IStore, IConfigOptions, IConfigLoader } from './interfaces';

export class Config<T extends IStore = IStore> implements OnDispose {
  private _stores: T = {} as T;
  private readonly _configLoader: IConfigLoader;

  get store(): T {
    return this._stores;
  }
  static for(
    options: IConfigOptions,
    configLoader?: IConfigLoader,
  ): FactoryProvider<Config> {
    return {
      provide: Config,
      useFactory: async () => {
        const config = new Config(options, configLoader);
        await config.loadConfigs();
        return config;
      },
    };
  }
  constructor(
    private readonly _options: IConfigOptions,
    configLoader?: IConfigLoader,
  ) {
    this._configLoader = configLoader
      ? configLoader
      : new ConfigLoader(this, this._options);
  }
  public onDispose(): void {
    this._stores = {} as T;
  }
  public get<T = unknown>(key: string, defaultValue?: T): T {
    let valueToReturn = prop(key)(this._stores);
    if (isUndefined(valueToReturn)) {
      valueToReturn = defaultValue;
    }
    return this.parseBooleanValue<T>(valueToReturn);
  }
  public env<T = unknown>(key: string, defaultValue?: T): T {
    const value = process.env[key] || defaultValue;
    return this.parseBooleanValue<T>(value);
  }
  protected async loadConfigs(): Promise<void> {
    const modules = await this._configLoader.importConfigs(this._options);
    modules.forEach(
      (module) => (this._stores = merge(module, this._stores) as T),
    );
  }
  protected parseBooleanValue<T = unknown>(value: unknown): T {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    return value as T;
  }
}
