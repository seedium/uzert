import Logger from '@uzert/logger';
import { IProvider } from '../interfaces';
import { IProviderLoaders } from '../interfaces/Boot.interface';

export default class BootService implements IProvider {
  public loadedProviders: {
    [name: string]: IProvider;
  } = {};

  public async boot(providers: IProviderLoaders) {
    for (const name in providers) {
      if (name) {
        const [provider, ...params] = providers[name];
        await this.loadProvider(name, provider, params);
      }
    }

    // run handles for errors and shutdowns
    process.on('uncaughtException', this.handleError);
    process.on('unhandledRejection', this.handleError);
    process.on('SIGTERM', this.handleGracefullyShutdown);
    process.on('SIGINT', this.handleGracefullyShutdown);
  }

  public async dispose() {
    // unboot providers in reverse order
    const providerNames = Object.keys(this.loadedProviders).reverse();

    for (const name of providerNames) {
      if (this.loadedProviders[name].unBoot) {
        // @ts-ignore
        await this.loadedProviders[name].unBoot();
      }

      delete this.loadedProviders[name];
    }
  }

  public async loadProvider(name: string, provider: IProvider, params: any[] = []): Promise<void> {
    try {
      if (!provider.boot) {
        throw new Error(`Invalid provider. Please check "boot" method in provider ${name}`);
      }

      await provider.boot(...params);

      // add provider to loaded
      this.loadedProviders[name] = provider;
    } catch (e) {
      Logger.pino.error(new Error(`Can't load service "${name}"`));
      throw e;
    }
  }

  protected handleError(err: Error | any) {
    Logger.pino.error(err);
  }

  protected handleGracefullyShutdown = async () => {
    Logger.pino.info(`Gracefully shutdown`);
    await this.unBoot();
    process.exit(0);
  }
}
