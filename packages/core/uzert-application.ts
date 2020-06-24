import { UzertContainer } from './injector/uzert-container';
import { HttpAdapter } from './adapters';
import { UzertApplicationContext } from './uzert-application-context';

export class UzertApplication<ApplicationInstance extends HttpAdapter> extends UzertApplicationContext {
  get httpAdapter(): ApplicationInstance {
    return this._httpAdapter;
  }
  constructor(container: UzertContainer, private readonly _httpAdapter: ApplicationInstance) {
    super(container);
  }
  public async init(): Promise<this> {
    if (this.isInitialized) {
      return this;
    }

    await this.httpAdapter.run();
    await this.httpAdapter.bootKernel();
    await this.httpAdapter.bootRouter();
    this.isInitialized = true;

    return this;
  }
}
