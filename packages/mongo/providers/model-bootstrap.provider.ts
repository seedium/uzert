import * as path from 'path';
import * as glob from 'glob';
// providers
import MongoClient from '../services/client';
// types
import { IProvider } from '@uzert/core';
import { IBootstrapOptions, IModel } from '../interfaces';

class ModelBootstrapProvider implements IProvider {
  public repository: {
    [model: string]: IModel;
  } = {};

  public async boot({
    basePath = path.resolve('src', 'app', 'Models'),
    pattern = '**/*.ts',
    useAbsolute = true,
    errorHandler,
  }: IBootstrapOptions = {}) {
    const models = await this.loadModels(basePath, pattern);

    const promises = models.map(async (name) => {
      const model = (useAbsolute
        ? await import('app/Models/' + name)
        : await import(path.resolve(basePath as string, name))
      ).default;

      await model.boot(MongoClient.db, {
        errorHandler,
      });
    });
    await Promise.all(promises);
  }

  public unBoot(): void {
    for (const name in this.repository) {
      if (this.repository[name].unBoot) {
        // @ts-ignore
        this.repository[name].unBoot();
      }
    }

    this.repository = {};
  }

  public addToRepository(name: string, model: IModel) {
    this.repository[name] = model;
  }

  public getFromRepository(name: string): IModel | undefined {
    return this.repository[name];
  }

  protected async loadModels(basePath: string, pattern: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      glob(path.resolve(basePath, pattern), (err, matches: string[]) => {
        if (err) {
          return reject(err);
        }

        matches = matches.map((modelPath: string) => {
          const [, model] = modelPath.match(new RegExp(basePath + '/(.*).ts'));

          return model;
        });

        return resolve(matches);
      });
    });
  }
}

export default new ModelBootstrapProvider();
