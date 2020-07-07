import { UzertContainer } from './injector/uzert-container';
import { Type, Abstract, IUzertApplicationContext, ContextId } from './interfaces';
import { ContainerScanner } from './injector/container-scanner';
import { Module } from './injector/module';
import { UnknownElementError } from './errors';
import { Injector } from './injector/injector';
import { createContextId } from './utils/context-id-factory';

export class UzertApplicationContext implements IUzertApplicationContext {
  protected isInitialized = false;

  protected readonly injector = new Injector();
  private readonly containerScanner: ContainerScanner;

  get container() {
    return this._container;
  }
  constructor(private readonly _container: UzertContainer, private contextModule: Module = null) {
    this.containerScanner = new ContainerScanner(_container);
  }
  public get<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    options: { strict: boolean } = { strict: false },
  ): TResult {
    return this.find<TInput, TResult>(typeOrToken);
  }
  public async resolve<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | string | symbol,
    contextId = createContextId(),
    options: { strict: boolean } = { strict: false },
  ): Promise<TResult> {
    return this.resolvePerContext(typeOrToken, this.contextModule, contextId);
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
  protected async resolvePerContext<TInput = any, TResult = TInput>(
    typeOrToken: Type<TInput> | string | symbol,
    contextModule: Module,
    contextId: ContextId,
  ): Promise<TResult> {
    const [wrapper, collection] = this.containerScanner.getWrapperCollectionPairByHost(typeOrToken, contextModule);

    const instance = await this.injector.loadPerContext<any>(wrapper.instance, wrapper.host, collection, contextId);

    if (!instance) {
      throw new UnknownElementError();
    }

    return instance;
  }
  protected async dispose(): Promise<void> {
    // Uzert application context has no server
    // to dispose, therefore just call a noop
    return Promise.resolve();
  }
}
