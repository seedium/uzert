import { UzertContainer } from './injector/uzert-container';
import { HttpAdapter } from './adapters';
import { UzertApplicationContext } from './uzert-application-context';

export class UzertApplication<ApplicationInstance = HttpAdapter, ServerOptions = any> extends UzertApplicationContext {
  constructor(container: UzertContainer, private readonly httpAdapter: HttpAdapter) {
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
