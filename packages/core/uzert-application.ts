import { UzertContainer } from './injector';
import { HttpAdapter } from './adapters';
import { UzertApplicationContext } from './uzert-application-context';
import { RouterResolver } from './router';

export class UzertApplication<ApplicationInstance extends HttpAdapter> extends UzertApplicationContext {
  private readonly _routerResolver: RouterResolver;
  get httpAdapter(): ApplicationInstance {
    return this._httpAdapter;
  }
  constructor(container: UzertContainer, private readonly _httpAdapter: ApplicationInstance) {
    super(container);
    this._routerResolver = new RouterResolver(container, _httpAdapter);
  }
  public async listen(...args: any[]): Promise<UzertApplication<ApplicationInstance>> {
    if (this.isInitialized) {
      return this;
    }
    await this.init();
    await this.httpAdapter.listen(...args);
    return this;
  }
  public async init(): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    await this.callInitHook();
    await this._routerResolver.registerRoutes();
    await this.httpAdapter.run();
    this.isInitialized = true;

    return this;
  }
  protected async dispose(): Promise<void> {
    await this._httpAdapter.onDispose();
  }
}
