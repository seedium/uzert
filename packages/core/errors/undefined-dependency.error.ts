import { InjectorDependencyContext } from '../interfaces';
import { Module } from '../injector/module';

export class UndefinedDependencyError extends Error {
  constructor(name, dependencyContext: InjectorDependencyContext, moduleRef?: Module) {
    super(`Undefined Dependency Error`);

    this.name = 'UndefinedDependencyError';
  }
}
