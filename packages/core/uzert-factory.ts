import { isFunction } from '@uzert/helpers';
import { HttpAdapter } from './adapters';
import { UzertContainer } from './injector/uzert-container';
import { InstanceLoader } from './injector/instance-loader';
import { DependenciesScanner } from './injector/scanner';
import { UzertApplication } from './uzert-application';
import { UzertApplicationContext } from './uzert-application-context';
import { ErrorsZone } from './errors/handlers/errors-zone';

export class UzertFactoryStatic {
  public async create<ApplicationInstance, ServerOptions = any>(
    module: any,
    httpServer: HttpAdapter,
    serverOptions?: ServerOptions,
  ): Promise<ApplicationInstance | any> {
    const container = new UzertContainer();

    await this.initialize(module, container);

    const instance = new UzertApplication<ApplicationInstance, ServerOptions>(container, httpServer, serverOptions);

    // return this.createUzertInstance<ApplicationInstance>(instance);
  }

  public async createApplicationContext(module: any) {
    const container = new UzertContainer();

    await this.initialize(module, container);

    const root = container.getModules().values().next().value;

    const applicationContext = this.createUzertInstance<UzertApplicationContext>(
      new UzertApplicationContext(container, root),
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

  private createErrorZone(receiver: Record<string, any>, prop: string): Function {
    return (...args: unknown[]) => {
      let result;

      ErrorsZone.run(() => {
        result = receiver[prop](...args);
      });

      return result;
    };
  }
}

export const UzertFactory = new UzertFactoryStatic();
