import { resolve as resolvePath, join } from 'path';
import * as glob from 'glob';
import { ProviderInstance } from '@uzert/core';
import { isFunction, isUndefined, prop } from '@uzert/helpers';
import { IStore, IConfigBootSpec, IConfigOptions } from './interfaces';

export class Config extends ProviderInstance {
  private _stores: IStore = {};

  static boot(options: IConfigOptions) {
    return {
      provide: Config,
      useFactory: async () => {
        const config = new Config(options);
        await config.loadConfigs();
        return config;
      },
    };
  }
  constructor(private readonly _options: IConfigOptions) {
    super();
  }
  public dispose() {
    this._stores = {};
  }
  public get(key: string, defaultValue?: any): any {
    let valueToReturn = prop(key)(this._stores);
    if (isUndefined(valueToReturn)) {
      valueToReturn = defaultValue;
    }

    if (valueToReturn === 'true') {
      valueToReturn = true;
    } else if (valueToReturn === 'false') {
      valueToReturn = false;
    }

    return valueToReturn;
  }

  public env(key: string, defaultValue?: any): any {
    return process.env[key] || defaultValue;
  }
  protected async loadConfigs(): Promise<any> {
    const configFiles = await this.loadFiles(this._options.path, this._options.pattern);
    const configs = this.normalizeWithNamespaces(this._options.path, configFiles);
    await this.importConfigs(configs);
  }
  protected async loadFiles(path: string, pattern: string = '*.ts'): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(resolvePath(path, pattern), async (err, configFiles) => {
        if (err) {
          return reject(err);
        }

        return resolve(configFiles);
      });
    });
  }
  protected normalizeWithNamespaces(basePath: string, configFiles: string[]): IConfigBootSpec {
    return configFiles.reduce((acc, config) => {
      const [namespace] = config.match(/([^\/]+)(?=\.\w+$)/);

      acc = {
        ...acc,
        [namespace]: import(join(this._options.path, namespace)),
      };

      return acc;
    }, {});
  }
  protected async importConfigs(configs: any): Promise<void> {
    await Promise.all(
      Object.keys(configs).map(async (configKey) => {
        const module = await configs[configKey];
        const config = module.default;

        if (!isFunction(config)) {
          return;
        }

        this._stores[configKey] = config(this);
      }),
    );
  }
}
