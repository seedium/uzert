import { UzertContainer } from './uzert-container';
import { Module } from './module';
import { Type } from '../interfaces';
import { MODULE_KEYS } from '../constants';

export class DependenciesScanner {
  constructor(private readonly container: UzertContainer) {}

  public async scan(module: Type<any>) {
    await this.scanForModules(module);
    await this.scanModulesForDependencies();
  }

  public async scanForModules(module: Type<unknown>, scope: Type<unknown>[] = []): Promise<Module> {
    return await this.insertModule(module, scope);
  }

  public async scanModulesForDependencies() {
    const modules = this.container.getModules();

    for (const [token, { metatype }] of modules) {
      this.reflectProviders(metatype, token);
      this.reflectControllers(metatype, token);
    }
  }

  public reflectProviders(module: Type<any>, token: string) {
    const providers = this.reflectMetadata(module, MODULE_KEYS.PROVIDERS);

    providers.forEach((provider) => {
      this.insertProvider(provider, token);
    });
  }

  public reflectControllers(module: Type<any>, token: string) {
    const controllers = this.reflectMetadata(module, MODULE_KEYS.CONTROLLERS);

    controllers.forEach((provider) => {
      this.insertController(provider, token);
    });
  }

  public reflectMetadata(metatype: Type<any>, metadataKey: string) {
    return Reflect.getMetadata(metadataKey, metatype) || [];
  }

  public async insertModule(module: any, scope: Type<unknown>[]): Promise<Module> {
    return this.container.addModule(module, scope);
  }

  public insertProvider(provider: Type<any>, token: string) {
    return this.container.addProvider(provider, token);
  }

  public insertController(controller: Type<any>, token: string) {
    return this.container.addController(controller, token);
  }
}
