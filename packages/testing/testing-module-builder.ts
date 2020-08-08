import {
  UzertContainer,
  ModuleOptions,
  DependenciesScanner,
  Module,
  InstanceLoader,
  UzertApplicationContext,
  Type,
} from '@uzert/core';

export class TestingModuleBuilder {
  private readonly _container = new UzertContainer();
  private readonly _scanner: DependenciesScanner;
  private readonly _instanceLoader = new InstanceLoader(this._container);
  private readonly module: Type<unknown>;
  constructor(metadata: ModuleOptions) {
    this._scanner = new DependenciesScanner(this._container);
    this.module = this.createModule(metadata);
  }
  public async compile(): Promise<UzertApplicationContext> {
    await this._scanner.scan(this.module);
    await this._instanceLoader.createInstancesOfDependencies();
    return new UzertApplicationContext(this._container);
  }
  private createModule(metadata: ModuleOptions): Type<unknown> {
    class RootTestModule {}
    Module(metadata)(RootTestModule);
    return RootTestModule;
  }
}
