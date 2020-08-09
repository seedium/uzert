import { isFunction, isPlainObject } from '@uzert/helpers';
import * as glob from 'glob';
import { resolve as resolvePath } from 'path';
import {
  IConfigBootSpec,
  IConfigLoader,
  IConfigLoaderOptions,
} from '../interfaces';
import { Config } from '../config.provider';

export class ConfigLoader implements IConfigLoader {
  constructor(
    private readonly _config: Config,
    private readonly _options: IConfigLoaderOptions,
  ) {}
  public async importConfigs(): Promise<Record<string, unknown>[]> {
    const files = await this.loadFiles(
      this._options.path,
      this._options.pattern,
    );
    const importFiles = this.normalizeWithNamespaces(this._options.path, files);

    const configs = await Promise.all(
      Object.entries(importFiles).map(async ([namespace, configPath]) => {
        const module = await import(configPath);
        const config = module.default as unknown;

        if (isFunction(config)) {
          return {
            [namespace]: config(this),
          };
        } else if (isPlainObject(config)) {
          return {
            [namespace]: config,
          };
        }
      }),
    );

    return configs.filter((config) => !!config);
  }
  protected async loadFiles(path: string, pattern = '*.ts'): Promise<string[]> {
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
       * Current behaviour: namespace will be with name `<filename>.config`
       * Expected behaviour: namespace must be without custom pattern and has name `<filename>`
       * */
      const [namespace] = config.match(/([^\/]+)(?=\.\w+$)/);

      acc = {
        ...acc,
        [namespace]: config,
      };

      return acc;
    }, {});
  }
}
