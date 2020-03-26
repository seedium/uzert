import * as path from 'path';
import * as glob from 'glob';
import { IProvider } from '@uzert/core';
import { prop } from '@uzert/helpers';
import { IStore, IConfigBootSpec, IConfigOptions } from './index';

export class Config implements IProvider {
  public stores: IStore = {};

  public async boot({
    basePath = path.resolve('src', 'app', 'Config'),
    pattern = '*.ts',
    useAbsolute = true,
  }: IConfigOptions = {}) {
    const configs = await this.loadConfigs(basePath, pattern, useAbsolute);

    await Promise.all(
      Object.keys(configs).map(async configKey => {
        const config = await configs[configKey];
        this.stores[configKey] = config.default;
      }),
    );
  }

  public unBoot() {
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

  protected async loadConfigs(basePath: string, pattern: string, useAbsolute?: boolean): Promise<IConfigBootSpec> {
    return new Promise((resolve, reject) => {
      glob(path.resolve(basePath, pattern), (err, configFiles) => {
        if (err) {
          return reject(err);
        }

        const configs = configFiles.reduce((acc, config) => {
          const [namespace] = config.match(/([^\/]+)(?=\.\w+$)/);

          acc = {
            ...acc,
            [namespace]: useAbsolute ? import('app/Config/' + namespace) : import(path.join(basePath, namespace)),
          };

          return acc;
        }, {});

        return resolve(configs);
      });
    });
  }
}

export default new Config();
