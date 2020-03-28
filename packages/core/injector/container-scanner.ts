import { isFunction } from '@uzert/helpers';
import { Type, Abstract } from '../interfaces';
import { Module } from './module';
import { UzertContainer } from './uzert-container';
import { InstanceWrapper } from './instance-wrapper';
import { UnknownElementError } from '../errors';

type HostCollection = 'providers' | 'controllers';

export class ContainerScanner {
  private flatContainer: Partial<Module>;

  constructor(private readonly container: UzertContainer) {}

  public find<TInput = any, TResult = TInput>(typeOrToken: Type<TInput> | Abstract<TInput> | string | symbol): TResult {
    this.initFlatContainer();
    return this.findInstanceByToken<TInput, TResult>(typeOrToken, this.flatContainer);
  }

  public findInstanceByToken<TInput = any, TResult = TInput>(
    metatypeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextModule: Partial<Module>,
  ): TResult {
    const [instanceWrapper] = this.getWrapperCollectionPairByHost(metatypeOrToken, contextModule);

    return (instanceWrapper.instance as unknown) as TResult;
  }

  public getWrapperCollectionPairByHost<TInput = any, TResult = TInput>(
    metatypeOrToken: Type<TInput> | Abstract<TInput> | string | symbol,
    contextModule: Partial<Module>,
  ): [InstanceWrapper<TResult>, Map<string, InstanceWrapper>] {
    const name = isFunction(metatypeOrToken) ? (metatypeOrToken as Function).name : metatypeOrToken;

    const collectionName = this.getHostCollection(name as string, contextModule);

    const instanceWrapper = contextModule[collectionName].get(name as string);

    if (!instanceWrapper) {
      throw new UnknownElementError(name && name.toString());
    }

    return [instanceWrapper as InstanceWrapper<TResult>, contextModule[collectionName]];
  }

  private initFlatContainer() {
    if (this.flatContainer) {
      return;
    }

    const modules = this.container.getModules();
    const initialValue: Record<string, any[]> = {
      providers: [],
      controllers: [],
    };

    const merge = <T = unknown>(initial: Map<string, T> | T[], arr: Map<string, T>) => [...initial, ...arr];

    const partialModule = ([...modules.values()].reduce(
      (current, next) => ({
        providers: merge(current.providers, next.providers),
        controllers: merge(current.controllers, next.controllers),
      }),
      initialValue,
    ) as any) as Partial<Module>;

    this.flatContainer = {
      providers: new Map(partialModule.providers),
      controllers: new Map(partialModule.controllers),
    };
  }

  private getHostCollection(token: string, { providers, controllers }: Partial<Module>): HostCollection {
    if (providers.has(token)) {
      return 'providers';
    }

    return 'controllers';
  }
}
