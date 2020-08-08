import { resolve as resolvePath } from 'path';
import * as glob from 'glob';
import { OnDispose } from '@uzert/core';
import { isFunction, isUndefined, prop, isPlainObject } from '@uzert/helpers';
import { IStore, IConfigBootSpec, IConfigOptions } from './interfaces';

export class Config implements OnDispose {
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
  constructor(private readonly _options: IConfigOptions) {}
  public onDispose() {
    this._stores = {};
  }
  public get(key: string, defaultValue?: any): any {
    let valueToReturn = prop(key)(this._stores);
    if (isUndefined(valueToReturn)) {
      valueToReturn = defaultValue;
    }
    return this.parseBooleanValue(valueToReturn);
  }
  public env(key: string, defaultValue?: any): any {
    const value = process.env[key] || defaultValue;
    return this.parseBooleanValue(value);
  }
  protected async loadConfigs(): Promise<any> {
    const configFiles = await this.loadFiles(
      this._options.path,
      this._options.pattern,
    );
    const configs = this.normalizeWithNamespaces(
      this._options.path,
      configFiles,
    );
    await this.importConfigs(configs);
  }
  protected async loadFiles(
    path: string,
    pattern = '*.ts',
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(resolvePath(path, pattern), async (err, configFiles) => {
        if (err) {
          return reject(err);
        }

        return resolve(configFiles);
      });
    });
  }
  protected normalizeWithNamespaces(
    basePath: string,
    configFiles: string[],
  ): IConfigBootSpec {
    return configFiles.reduce((acc, config) => {
      /*
       * TODO add support to erasing custom pattern and applying namespace without suffix
       * For example, if pattern was provided `*.config.ts`:
       * Current behaviour: namespace will be `<filename>.config`
       * Expected behaviour: namespace should without custom pattern and should be just `<filename>`
       * */
      const [namespace] = config.match(/([^\/]+)(?=\.\w+$)/);

      acc = {
        ...acc,
        [namespace]: config,
      };

      return acc;
    }, {});
  }
  protected async importConfigs(configs: IConfigBootSpec): Promise<void> {
    for (const [namespace, configPath] of Object.entries(configs)) {
      const module = await import(configPath);
      const config = module.default;

      if (isFunction(config)) {
        this._stores[namespace] = config(this);
      } else if (isPlainObject(config)) {
        this._stores[namespace] = config;
      }
    }
  }
  protected parseBooleanValue(value: any): any {
    if (value === 'true') {
      value = true;
    } else if (value === 'false') {
      value = false;
    }
    return value;
  }
}
