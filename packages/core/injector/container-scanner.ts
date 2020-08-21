import { capitalize, isFunction, isString } from '@uzert/helpers';
import {
  HostCollection,
  ProviderToken,
  ProviderStaticToken,
} from '../interfaces';
import { Module } from './module';
import { UzertContainer } from './uzert-container';
import { InstanceWrapper } from './instance-wrapper';
import { UnknownElementError } from '../errors';

export class ContainerScanner {
  private flatContainer: Partial<Module>;
  constructor(private readonly container: UzertContainer) {}
  public find<TInput = unknown, TResult = TInput>(
    typeOrToken: ProviderToken,
    contextModule?: Partial<Module>,
  ): TResult {
    this.initFlatContainer();
    return this.findInstanceByToken<TInput, TResult>(
      typeOrToken,
      contextModule ? contextModule : this.flatContainer,
    );
  }
  public findInstanceByToken<TInput = unknown, TResult = TInput>(
    metatypeOrToken: ProviderToken,
    contextModule: Partial<Module>,
  ): TResult {
    const [instanceWrapper] = this.getWrapperCollectionPairByHost(
      metatypeOrToken,
      contextModule,
    );

    return (instanceWrapper.instance as unknown) as TResult;
  }
  public findInjectablesPerMethodContext<TInput = unknown, TResult = TInput>(
    typeOrToken: ProviderToken,
    contextMethod: Function,
  ): TResult {
    let token = this.getStaticTypeToken(typeOrToken);
    if (isString(token)) {
      token = token + capitalize(contextMethod.name);
    }
    try {
      return this.find(token);
    } catch {
      return this.find(typeOrToken);
    }
  }
  public getWrapperCollectionPairByHost<TInput = unknown, TResult = TInput>(
    metatypeOrToken: ProviderToken,
    contextModule: Partial<Module>,
  ): [InstanceWrapper<TResult>, Map<string, InstanceWrapper>] {
    const name = this.getStaticTypeToken(metatypeOrToken);
    const collectionName = this.getHostCollection(name, contextModule);
    const instanceWrapper = contextModule[collectionName].get(name as string);

    if (!instanceWrapper) {
      throw new UnknownElementError(name && name.toString());
    }

    return [
      instanceWrapper as InstanceWrapper<TResult>,
      contextModule[collectionName as string],
    ];
  }

  private initFlatContainer() {
    if (this.flatContainer) {
      return;
    }

    const modules = this.container.getModules();
    const initialValue: Record<string, unknown[]> = {
      providers: [],
      controllers: [],
      routes: [],
      injectables: [],
    };

    const merge = <T = unknown>(
      initial: Map<ProviderStaticToken, T> | T[],
      arr: Map<ProviderStaticToken, T>,
    ) => [...initial, ...arr];

    const partialModule = ([...modules.values()].reduce(
      (current, next) => ({
        providers: merge(current.providers, next.providers),
        controllers: merge(current.controllers, next.controllers),
        routes: merge(current.routes, next.routes),
        injectables: merge(current.injectables, next.injectables),
      }),
      initialValue,
    ) as unknown) as Partial<Module>;

    this.flatContainer = {
      providers: new Map(partialModule.providers),
      controllers: new Map(partialModule.controllers),
      routes: new Map(partialModule.routes),
      injectables: new Map(partialModule.injectables),
    };
  }
  private getHostCollection(
    token: ProviderStaticToken,
    { providers, controllers, routes }: Partial<Module>,
  ): HostCollection {
    if (providers.has(token)) {
      return 'providers';
    }

    if (routes.has(token)) {
      return 'routes';
    }

    if (controllers.has(token)) {
      return 'controllers';
    }

    return 'injectables';
  }
  private getStaticTypeToken<TInput = unknown>(
    metatypeOrToken: ProviderToken,
  ): ProviderStaticToken {
    return isFunction(metatypeOrToken)
      ? (metatypeOrToken as Function).name
      : metatypeOrToken;
  }
}
