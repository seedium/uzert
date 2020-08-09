import { isFunction } from '@uzert/helpers';
import { HttpAdapter } from './adapters';
import {
  UzertContainer,
  InstanceLoader,
  DependenciesScanner,
  ContainerScanner,
} from './injector';
import { UzertApplication } from './uzert-application';
import { UzertApplicationContext } from './uzert-application-context';
import { ErrorsZone } from './errors/handlers/errors-zone';
import { FactoryProvider, Type } from './interfaces';
import { isHttpAdapterCustomProvider } from './utils/is-http-adapter-custom-provider';

export class UzertFactoryStatic {
  public async create<ApplicationAdapter extends HttpAdapter>(
    module: Type<unknown>,
    httpServer: HttpAdapter | FactoryProvider<ApplicationAdapter>,
  ): Promise<UzertApplication<ApplicationAdapter>> {
    const container = new UzertContainer();

    if (isHttpAdapterCustomProvider<ApplicationAdapter>(httpServer)) {
      container.addHttpAdapter(httpServer);
      await this.initialize(module, container);
      const containerScanner = new ContainerScanner(container);
      httpServer = containerScanner.find<ApplicationAdapter>(
        httpServer.provide,
      );
    } else {
      await this.initialize(module, container);
    }
    const target = this.createUzertInstance(
      new UzertApplication<ApplicationAdapter>(
        container,
        httpServer as ApplicationAdapter,
      ),
    );
    return this.createAdapterProxy<ApplicationAdapter>(target, httpServer);
  }
  public async createApplicationContext(
    module: Type<unknown>,
  ): Promise<UzertApplicationContext> {
    const container = new UzertContainer();

    await this.initialize(module, container);
    const applicationContext = this.createUzertInstance<
      UzertApplicationContext
    >(new UzertApplicationContext(container));
    return applicationContext.init();
  }
  private async initialize(module: Type<unknown>, container: UzertContainer) {
    const instanceLoader = new InstanceLoader(container);
    const dependenciesScanner = new DependenciesScanner(container);

    try {
      await ErrorsZone.asyncRun(async () => {
        await dependenciesScanner.scan(module);
        await instanceLoader.createInstancesOfDependencies();
      });
    } catch (e) {
      process.abort();
    }
  }
  private createUzertInstance<T>(instance: T): T {
    return this.createProxy(instance);
  }
  /* eslint-disable-next-line*/
  private createProxy(target: any) {
    const proxy = this.createErrorProxy();

    return new Proxy(target, {
      get: proxy,
      set: proxy,
    });
  }
  private createErrorProxy() {
    return (receiver: object, prop: string) => {
      if (!(prop in receiver)) {
        return;
      }

      if (isFunction(receiver[prop])) {
        return this.createErrorZone(receiver, prop);
      }

      return receiver[prop];
    };
  }
  private createAdapterProxy<T extends HttpAdapter>(
    app: UzertApplication<T>,
    adapter: HttpAdapter,
  ): UzertApplication<T> {
    return (new Proxy(app, {
      get: (receiver: object, prop: string) => {
        if (!(prop in receiver) && prop in adapter) {
          return this.createErrorZone(adapter, prop);
        }
        return receiver[prop];
      },
    }) as unknown) as UzertApplication<T>;
  }
  private createErrorZone(receiver: object, prop: string): Function {
    return (...args: unknown[]) => {
      let result = undefined;

      ErrorsZone.run(() => {
        result = receiver[prop](...args);
      });

      return result;
    };
  }
}

export const UzertFactory = new UzertFactoryStatic();
