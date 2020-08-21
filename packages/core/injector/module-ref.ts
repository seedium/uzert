import { ContainerScanner } from './container-scanner';
import { UzertContainer } from './uzert-container';
import { Abstract, ProviderToken, Type } from '../interfaces';
import { Module } from './module';

export abstract class ModuleRef {
  private _containerScanner: ContainerScanner;

  private get containerScanner(): ContainerScanner {
    if (!this._containerScanner) {
      this._containerScanner = new ContainerScanner(this.container);
    }
    return this._containerScanner;
  }

  constructor(protected readonly container: UzertContainer) {}

  public abstract get<TInput = unknown, TResult = TInput>(
    typeOrToken: ProviderToken,
    options?: { strict: boolean },
  ): TResult;

  protected find<TInput = unknown, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextModule?: Module,
  ): TResult {
    return this.containerScanner.find<TResult>(typeOrToken, contextModule);
  }
}
