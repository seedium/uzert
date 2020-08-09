import { UzertContainer } from './uzert-container';
import { ModulesContainer } from './modules-container';
import { Module } from './module';
import { Injector } from './injector';
import { IInjectable } from '../interfaces';

export class InstanceLoader {
  private readonly injector = new Injector();

  constructor(private readonly container: UzertContainer) {}

  public async createInstancesOfDependencies(): Promise<void> {
    const modules = this.container.getModules();

    this.createPrototypes(modules);
    await this.createInstances(modules);
  }
  private createPrototypes(modules: ModulesContainer) {
    modules.forEach((module) => {
      this.createPrototypesOfProviders(module);
      this.createPrototypesOfControllers(module);
      this.createPrototypesOfRoutes(module);
      this.createPrototypesOfInjectables(module);
    });
  }
  private async createInstances(modules: Map<string, Module>) {
    await Promise.all(
      [...modules.values()].map(async (module) => {
        await this.createInstancesOfProviders(module);
        await this.createInstancesOfControllers(module);
        await this.createInstancesOfRoutes(module);
        await this.createInstancesOfInjectables(module);
      }),
    );
  }
  private createPrototypesOfProviders(module: Module) {
    const { providers } = module;
    providers.forEach((wrapper) =>
      this.injector.loadPrototype<IInjectable>(wrapper, providers),
    );
  }
  private createPrototypesOfControllers(module: Module) {
    const { controllers } = module;
    controllers.forEach((wrapper) =>
      this.injector.loadPrototype<IInjectable>(wrapper, controllers),
    );
  }
  private createPrototypesOfRoutes(module: Module) {
    const { routes } = module;
    routes.forEach((wrapper) => this.injector.loadPrototype(wrapper, routes));
  }
  private createPrototypesOfInjectables(module: Module) {
    const { injectables } = module;
    injectables.forEach((wrapper) =>
      this.injector.loadPrototype(wrapper, injectables),
    );
  }
  private async createInstancesOfProviders(module: Module) {
    const { providers } = module;
    const wrappers = [...providers.values()];
    await Promise.all(
      wrappers.map((item) => this.injector.loadProvider(item, module)),
    );
  }
  private async createInstancesOfControllers(module: Module) {
    const { controllers } = module;
    const wrappers = [...controllers.values()];
    await Promise.all(
      wrappers.map((item) => this.injector.loadController(item, module)),
    );
  }
  private async createInstancesOfRoutes(module: Module) {
    const { routes } = module;
    const wrappers = [...routes.values()];
    await Promise.all(
      wrappers.map((item) => this.injector.loadRoute(item, module)),
    );
  }
  private async createInstancesOfInjectables(module: Module) {
    const { injectables } = module;
    const wrappers = [...injectables.values()];
    await Promise.all(
      wrappers.map((item) => this.injector.loadInjectable(item, module)),
    );
  }
}
