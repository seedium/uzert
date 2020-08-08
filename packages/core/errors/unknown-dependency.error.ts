import { InjectorDependencyContext } from '../interfaces';
import { Module } from '../injector/module';

export class UnknownDependencyError extends Error {
  constructor(
    name: string | symbol,
    dependencyContext: InjectorDependencyContext,
    moduleRef?: Module,
  ) {
    super(`Undefined Dependency Error`);

    this.name = 'UnknownDependencyError';
  }
}
