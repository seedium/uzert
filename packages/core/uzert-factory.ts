import { isFunction } from '@uzert/helpers';
import { HttpAdapter } from './adapters';
import { UzertContainer } from './injector/uzert-container';
import { InstanceLoader } from './injector/instance-loader';
import { DependenciesScanner } from './injector/scanner';
import { UzertApplication } from './uzert-application';
import { UzertApplicationContext } from './uzert-application-context';
import { ErrorsZone } from './errors/handlers/errors-zone';
import { FactoryProvider } from './interfaces';
import { isHttpAdapterCustomProvider } from './utils/is-http-adapter-custom-provider';

export class UzertFactoryStatic {
  public async create<ApplicationAdapter extends HttpAdapter>(
    module: any,
    httpServer: HttpAdapter | FactoryProvider<ApplicationAdapter>,
  ): Promise<UzertApplication<ApplicationAdapter>> {
    const container = new UzertContainer();

    await this.initialize(module, container);
    if (isHttpAdapterCustomProvider<ApplicationAdapter>(httpServer)) {
      httpServer = await this.initFactoryHttpAdapter<ApplicationAdapter>(module, container, httpServer);
    }
    const target = this.createUzertInstance(
      new UzertApplication<ApplicationAdapter>(container, httpServer as ApplicationAdapter),
    );
    return this.createAdapterProxy<ApplicationAdapter>(target, httpServer);
  }

  public async createApplicationContext(module: any) {
    const container = new UzertContainer();

    await this.initialize(module, container);
    const applicationContext = this.createUzertInstance<UzertApplicationContext>(
      new UzertApplicationContext(container),
    );
    return applicationContext.init();
  }

  private async initialize(module: any, container: UzertContainer) {
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

  private createProxy(target: any) {
    const proxy = this.createErrorProxy();

    return new Proxy(target, {
      get: proxy,
      set: proxy,
    });
  }

  private createErrorProxy() {
    return (receiver: Record<string, any>, prop: string) => {
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
      get: (receiver: Record<string, any>, prop: string) => {
        if (!(prop in receiver) && prop in adapter) {
          return this.createErrorZone(adapter, prop);
        }
        return receiver[prop];
      },
    }) as unknown) as UzertApplication<T>;
  }
  private createErrorZone(receiver: Record<string, any>, prop: string): Function {
    return (...args: unknown[]) => {
      let result;

      ErrorsZone.run(() => {
        result = receiver[prop](...args);
      });

      return result;
    };
  }
  private async initFactoryHttpAdapter<T extends HttpAdapter>(
    module: any,
    container: UzertContainer,
    httpFactoryProvider: FactoryProvider,
  ): Promise<T> {
    const dependenciesScanner = new DependenciesScanner(container);
    const instanceLoader = new InstanceLoader(container);
    const appModuleToken = await container.getModuleToken(module);
    const appModule = container.getModuleByToken(appModuleToken);
    dependenciesScanner.insertProvider(httpFactoryProvider, appModuleToken);
    const httpAdapterInstanceWrapper = appModule.getProviderInstanceWrapper(httpFactoryProvider);
    await instanceLoader.createInstanceWithInjectedProviders(httpAdapterInstanceWrapper, appModule);

    return httpAdapterInstanceWrapper.instance;
  }
}

export const UzertFactory = new UzertFactoryStatic();
