import { UzertContainer } from './injector/uzert-container';
import { Type, Abstract, IUzertApplicationContext, ContextId } from './interfaces';
import { ContainerScanner } from './injector/container-scanner';

export class UzertApplicationContext implements IUzertApplicationContext {
  protected isInitialized = false;
  private readonly containerScanner: ContainerScanner;

  get container() {
    return this._container;
  }
  constructor(private readonly _container: UzertContainer) {
    this.containerScanner = new ContainerScanner(_container);
  }
  public get<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    options: { strict: boolean } = { strict: false },
  ): TResult {
    return this.find<TInput, TResult>(typeOrToken);
  }
  public async close(): Promise<void> {
    await this.dispose();
  }
  public async init(): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    this.isInitialized = true;

    return this;
  }
  protected find<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
  ): TResult {
    return this.containerScanner.find<TInput, TResult>(typeOrToken);
  }
  protected async dispose(): Promise<void> {
    // Uzert application context has no server
    // to dispose, therefore just call a noop
    return Promise.resolve();
  }
}
