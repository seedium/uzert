import { ModulesContainer } from './modules-container';
import { Type, Provider, RouteModule, IInjectable } from '../interfaces';
import { CircularDependencyError, UnknownModuleError, InvalidModuleError } from '../errors';
import { Module } from './module';
import { ModuleTokenFactory } from './module-token-factory';
import { ModuleCompiler } from './module-compiler';

export class UzertContainer {
  private readonly moduleTokenFactory = new ModuleTokenFactory();
  private readonly moduleCompiler = new ModuleCompiler(this.moduleTokenFactory);
  private readonly modules = new ModulesContainer();
  public getModules(): ModulesContainer {
    return this.modules;
  }
  public addProvider(provider: Provider, token: string): string {
    if (!provider) {
      throw new CircularDependencyError();
    }

    if (!this.modules.has(token)) {
      throw new UnknownModuleError(token);
    }

    const moduleRef = this.modules.get(token);
    return moduleRef.addProvider(provider);
  }
  public addController(controller: Type<any>, token: string): string {
    if (!controller) {
      throw new CircularDependencyError();
    }

    if (!this.modules.has(token)) {
      throw new UnknownModuleError(token);
    }

    const moduleRef = this.modules.get(token);
    return moduleRef.addController(controller);
  }
  public addRoute(route: Type<RouteModule>, token: string): string {
    if (!route) {
      throw new CircularDependencyError();
    }
    if (!this.modules.has(token)) {
      throw new UnknownModuleError(token);
    }
    const moduleRef = this.modules.get(token);
    return moduleRef.addRoute(route);
  }
  public addInjectable(injectable: Provider, token: string, host?: Type<IInjectable>, hostMethodName?: string) {
    if (!this.modules.has(token)) {
      throw new UnknownModuleError(token);
    }
    const moduleRef = this.modules.get(token);
    moduleRef.addInjectable(injectable, host, hostMethodName);
  }
  public async addModule(metatype: Type<any>, scope: Type<any>[]): Promise<Module> {
    if (!metatype) {
      throw new InvalidModuleError(scope);
    }

    const { type, token } = await this.moduleCompiler.compile(metatype);

    if (this.modules.has(token)) {
      return;
    }

    const moduleRef = new Module(type, scope);
    this.modules.set(token, moduleRef);

    return moduleRef;
  }
  public async getModuleToken(metatype: Type<any>): Promise<string> {
    if (!metatype) {
      throw new InvalidModuleError([]);
    }
    const { token } = await this.moduleCompiler.compile(metatype);
    return token;
  }
  public getModuleByToken(token: string): Module {
    return this.modules.get(token);
  }
}
