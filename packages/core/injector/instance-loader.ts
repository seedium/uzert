import { UzertContainer } from './uzert-container';
import { ModulesContainer } from './modules-container';
import { Module } from './module';
import { Injector } from './injector';
import { IInjectable } from '../interfaces';
import { InstanceWrapper } from './instance-wrapper';

export class InstanceLoader {
  private readonly injector = new Injector();

  constructor(private readonly container: UzertContainer) {}

  public async createInstancesOfDependencies() {
    const modules = this.container.getModules();

    this.createPrototypes(modules);
    await this.createInstances(modules);
  }
  public async createInstanceWithInjectedProviders(provider: InstanceWrapper<IInjectable>, module: Module) {
    return this.injector.loadProvider(provider, module);
  }
  private createPrototypes(modules: ModulesContainer) {
    modules.forEach((module) => {
      this.createPrototypesOfProviders(module);
      this.createPrototypesOfControllers(module);
    });
  }

  private async createInstances(modules: Map<string, Module>) {
    await Promise.all(
      [...modules.values()].map(async (module) => {
        await this.createInstancesOfProviders(module);
        await this.createInstancesOfControllers(module);
      }),
    );
  }

  private createPrototypesOfProviders(module: Module) {
    const { providers } = module;
    providers.forEach((wrapper) => this.injector.loadPrototype<IInjectable>(wrapper, providers));
  }

  private createPrototypesOfControllers(module: Module) {
    const { controllers } = module;
    controllers.forEach((wrapper) => {});
  }

  private async createInstancesOfProviders(module: Module) {
    const { providers } = module;
    const wrappers = [...providers.values()];

    await Promise.all(wrappers.map((item) => this.injector.loadProvider(item, module)));
  }

  private async createInstancesOfControllers(module: Module) {}
}
