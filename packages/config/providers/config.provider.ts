import * as path from 'path';
import * as glob from 'glob';
import { ProviderInstance } from '@uzert/core';
import { prop } from '@uzert/helpers';
import { IStore, IConfigBootSpec, IConfigOptions } from '../interfaces';

export class Config extends ProviderInstance {
  private stores: IStore = {};

  static boot(options: IConfigOptions) {
    return {
      provide: Config,
      useFactory: async () => {
        const config = new Config(options);
        await config.loadConfigs();
      },
    };
  }
  constructor(private readonly _options: IConfigOptions) {
    super();
  }
  public dispose() {
    this.stores = {};
  }
  public get(key: string, defaultValue?: any): any {
    let valueToReturn: any = prop(key)(this.stores) || defaultValue;

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
    const configs = await this.importConfigs();
    await Promise.all(
      Object.keys(configs).map(async (configKey) => {
        const config = await configs[configKey];
        this.stores[configKey] = config.default;
      }),
    );
  }
  protected importConfigs(): Promise<IConfigBootSpec> {
    return new Promise((resolve, reject) => {
      glob(path.resolve(this._options.basePath, this._options.pattern), (err, configFiles) => {
        if (err) {
          return reject(err);
        }

        const configs = configFiles.reduce((acc, config) => {
          const [namespace] = config.match(/([^\/]+)(?=\.\w+$)/);

          acc = {
            ...acc,
            [namespace]: import(path.join(this._options.basePath, namespace)),
          };

          return acc;
        }, {});

        return resolve(configs);
      });
    });
  }
}
