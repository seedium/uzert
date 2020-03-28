import { UzertContainer } from './injector/uzert-container';
import { HttpAdapter } from './adapters/http.adapter';
import { UzertApplicationContext } from './uzert-application-context';

export class UzertApplication<ApplicationInstance = HttpAdapter, ServerOptions = any> extends UzertApplicationContext {
  constructor(container: UzertContainer, httpAdapter: HttpAdapter, serverOptions: ServerOptions) {
    super(container);
  }
}
