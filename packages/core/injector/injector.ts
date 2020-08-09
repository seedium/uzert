import { isUndefined, isNil, isString, isFunction } from '@uzert/helpers';
import { InstanceWrapper } from './instance-wrapper';
import { STATIC_CONTEXT } from './injector.constants';
import {
  IInjectable,
  InstancePerContext,
  Type,
  InjectorDependencyContext,
  PropertyDependency,
  ContextId,
  InjectorDependency,
  HostCollection,
  ProviderStaticToken,
  ProviderToken,
  SelfDeclaredMetadata,
} from '../interfaces';
import { Module } from './module';
import {
  METADATA_PARAMTYPES,
  SELF_DECLARED_DEPS_METADATA,
  PROPERTY_DEPS_METADATA,
  OPTIONAL_PROPERTY_DEPS_METADATA,
  OPTIONAL_DEPS_METADATA,
} from '../constants';
import { UnknownDependencyError } from '../errors';

export class Injector {
  public loadPrototype<T>(
    { name }: InstanceWrapper<T>,
    collection: Map<ProviderStaticToken, InstanceWrapper<T>>,
    contextId = STATIC_CONTEXT,
  ): void {
    if (!collection) {
      return;
    }

    const target = collection.get(name);
    const instance = target.createPrototype<T>(contextId);

    if (instance) {
      const wrapper = new InstanceWrapper({
        ...target,
        instance,
      });

      collection.set(name, wrapper);
    }
  }
  public async loadProvider(
    wrapper: InstanceWrapper<IInjectable>,
    moduleRef: Module,
    contextId = STATIC_CONTEXT,
  ): Promise<void> {
    const providers = moduleRef.providers;
    await this.loadInstance<IInjectable>(
      wrapper,
      providers,
      moduleRef,
      contextId,
    );
  }
  public async loadController(
    wrapper: InstanceWrapper<IInjectable>,
    moduleRef: Module,
    contextId = STATIC_CONTEXT,
  ): Promise<void> {
    const controllers = moduleRef.controllers;
    await this.loadInstance<IInjectable>(
      wrapper,
      controllers,
      moduleRef,
      contextId,
    );
  }
  public async loadRoute(
    wrapper: InstanceWrapper<IInjectable>,
    moduleRef: Module,
    contextId = STATIC_CONTEXT,
  ): Promise<void> {
    const routes = moduleRef.routes;
    await this.loadInstance<IInjectable>(
      wrapper,
      routes,
      moduleRef,
      contextId,
      ['controllers', 'providers'],
    );
  }
  public async loadInjectable<T = unknown>(
    wrapper: InstanceWrapper<T>,
    moduleRef: Module,
    contextId = STATIC_CONTEXT,
  ): Promise<void> {
    const injectables = moduleRef.injectables;
    await this.loadInstance<T>(wrapper, injectables, moduleRef, contextId);
  }
  public async loadInstance<T>(
    wrapper: InstanceWrapper<T>,
    collection: Map<ProviderStaticToken, InstanceWrapper>,
    moduleRef: Module,
    contextId: ContextId,
    lookupInCollections: HostCollection[] = ['providers'],
  ): Promise<void> {
    const instanceHost = wrapper.getInstanceByContextId(contextId);

    if (instanceHost.isPending) {
      return instanceHost.donePromise;
    }

    const done = this.applyDoneHook(instanceHost);
    const { name, inject } = wrapper;

    const targetWrapper = collection.get(name);

    if (isUndefined(targetWrapper)) {
      throw new Error(`Runtime Error: undefined "${name.toString()}" target`);
    }

    if (instanceHost.isResolved) {
      return done();
    }

    const callback = async (instances: unknown[]) => {
      const properties = await this.resolveProperties(
        wrapper,
        moduleRef,
        inject,
        contextId,
      );
      const instance = await this.instantiateClass(
        instances,
        wrapper,
        targetWrapper,
        contextId,
      );
      this.applyProperties(instance, properties);
      done();
    };

    await this.resolveConstructorParams<T>(
      wrapper,
      moduleRef,
      inject,
      callback,
      contextId,
      lookupInCollections,
    );
  }
  public applyDoneHook<T>(wrapper: InstancePerContext<T>): () => void {
    let done: () => void;

    wrapper.donePromise = new Promise<void>((resolve) => {
      done = resolve;
    });

    wrapper.isPending = true;
    return done;
  }
  public async resolveProperties<T>(
    wrapper: InstanceWrapper<T>,
    moduleRef: Module,
    inject?: InjectorDependency[],
    contextId?: ContextId,
  ): Promise<PropertyDependency[]> {
    if (!isNil(inject)) {
      return [];
    }

    const properties = this.reflectProperties(
      wrapper.metatype as Type<unknown>,
    );
    const instances = await Promise.all(
      properties.map(async (item: PropertyDependency) => {
        try {
          const dependencyContext = {
            key: item.key,
            name: item.name as string,
          };

          const paramWrapper = await this.resolveSingleParam<T>(
            wrapper,
            item.name,
            dependencyContext,
            moduleRef,
            contextId,
            item.key,
          );

          const instanceHost = paramWrapper.getInstanceByContextId(contextId);
          return instanceHost.instance;
        } catch (err) {
          if (!item.isOptional) {
            throw err;
          }
          return undefined;
        }
      }),
    );

    return properties.map((item: PropertyDependency, index: number) => ({
      ...item,
      instance: instances[index],
    }));
  }
  public applyProperties<T = unknown>(
    instance: T,
    properties: PropertyDependency[],
  ): void {
    properties
      .filter((item) => !isNil(item.instance))
      .forEach((item) => (instance[item.key] = item.instance));
  }
  public async instantiateClass<T = unknown>(
    instances: unknown[],
    wrapper: InstanceWrapper,
    targetMetatype: InstanceWrapper<T>,
    contextId: ContextId,
  ): Promise<T> {
    const { metatype, inject } = wrapper;
    const instanceHost = targetMetatype.getInstanceByContextId(contextId);

    if (isNil(inject)) {
      instanceHost.instance = new (metatype as Type<unknown>)(
        ...instances,
      ) as T;
    } else {
      const factoryReturnValue = ((targetMetatype.metatype as unknown) as Function)(
        ...instances,
      );
      instanceHost.instance = await factoryReturnValue;
    }

    instanceHost.isResolved = true;
    return instanceHost.instance;
  }
  public async resolveConstructorParams<T>(
    wrapper: InstanceWrapper<T>,
    moduleRef: Module,
    inject: InjectorDependency[],
    callback: (args: unknown[]) => void,
    contextId: ContextId,
    lookupInCollections: HostCollection[],
  ): Promise<void> {
    const dependencies: ProviderToken[] = isNil(inject)
      ? this.reflectConstructorParams<T>(wrapper.metatype)
      : inject;
    const optionalDependenciesIds = isNil(inject)
      ? this.reflectOptionalParams(wrapper.metatype as Type<unknown>)
      : [];

    const resolveParam = async (param: ProviderToken, index: number) => {
      try {
        const paramWrapper = await this.resolveSingleParam<T>(
          wrapper,
          param,
          { index, dependencies },
          moduleRef,
          contextId,
          index,
          lookupInCollections,
        );

        const instanceHost = paramWrapper.getInstanceByContextId(contextId);

        return instanceHost && instanceHost.instance;
      } catch (err) {
        const isOptional = optionalDependenciesIds.includes(index);
        if (!isOptional) {
          throw err;
        }
        return undefined;
      }
    };

    const instances = await Promise.all(dependencies.map(resolveParam));
    await callback(instances);
  }
  public reflectConstructorParams<T>(
    type: Type<T> | Function,
  ): ProviderToken[] {
    const paramtypes = Reflect.getMetadata(METADATA_PARAMTYPES, type) || [];
    const selfParams = this.reflectSelfParams<T>(type);

    selfParams.forEach(({ index, param }) => (paramtypes[index] = param));
    return paramtypes;
  }
  public reflectProperties<T>(type: Type<T>): PropertyDependency[] {
    const properties: PropertyDependency[] =
      Reflect.getMetadata(PROPERTY_DEPS_METADATA, type) || [];
    const optionalKeys: string[] =
      Reflect.getMetadata(OPTIONAL_PROPERTY_DEPS_METADATA, type) || [];

    return properties.map((item) => ({
      ...item,
      name: item.type,
      isOptional: optionalKeys.includes(item.key),
    }));
  }
  public reflectSelfParams<T>(
    type: Type<T> | Function,
  ): SelfDeclaredMetadata[] {
    return Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, type) || [];
  }
  public reflectOptionalParams<T>(type: Type<T>): unknown[] {
    return Reflect.getMetadata(OPTIONAL_DEPS_METADATA, type) || [];
  }
  public async resolveSingleParam<T>(
    wrapper: InstanceWrapper<T>,
    param: ProviderToken,
    dependencyContext: InjectorDependencyContext,
    moduleRef: Module,
    contextId: ContextId,
    keyOrIndex?: string | number,
    lookupInCollections: HostCollection[] = ['providers'],
  ): Promise<InstanceWrapper> {
    if (isUndefined(param)) {
      throw new UnknownDependencyError(
        wrapper.name,
        dependencyContext,
        moduleRef,
      );
    }

    return this.resolveComponentInstance<T>(
      moduleRef,
      isFunction(param) ? param.name : param,
      dependencyContext,
      wrapper,
      contextId,
      keyOrIndex,
      lookupInCollections,
    );
  }
  public async resolveComponentInstance<T>(
    moduleRef: Module,
    name: ProviderStaticToken,
    dependencyContext: InjectorDependencyContext,
    wrapper: InstanceWrapper<T>,
    contextId: ContextId,
    keyOrIndex?: string | number,
    lookupInCollections: HostCollection[] = ['providers'],
  ): Promise<InstanceWrapper> {
    let injectables = new Map<string | symbol, InstanceWrapper>([]);
    lookupInCollections.forEach((collectionName) => {
      injectables = new Map([...injectables, ...moduleRef[collectionName]]);
    });
    const instanceWrapper = await this.lookupComponent(
      injectables,
      moduleRef,
      { ...dependencyContext, name },
      wrapper,
      contextId,
      keyOrIndex,
    );

    return this.resolveComponentHost(moduleRef, instanceWrapper, contextId);
  }
  public async resolveComponentHost<T>(
    moduleRef: Module,
    instanceWrapper: InstanceWrapper<T>,
    contextId: ContextId,
  ): Promise<InstanceWrapper> {
    const instanceHost = instanceWrapper.getInstanceByContextId(contextId);

    if (!instanceHost.isResolved) {
      await this.loadProvider(instanceWrapper, moduleRef, contextId);
    }
    if (instanceWrapper.async) {
      const host = instanceWrapper.getInstanceByContextId(contextId);
      host.instance = await host.instance;
      instanceWrapper.setInstanceByContextId(contextId, host);
    }

    return instanceWrapper;
  }
  public async lookupComponent<T = unknown>(
    providers: Map<string | symbol, InstanceWrapper>,
    moduleRef: Module,
    dependencyContext: InjectorDependencyContext,
    wrapper: InstanceWrapper<T>,
    contextId: ContextId,
    keyOrIndex?: string | number,
  ): Promise<InstanceWrapper<T>> {
    const { name } = dependencyContext;

    if (providers.has(name)) {
      const instanceWrapper = providers.get(name);
      this.addDependencyMetadata(keyOrIndex, wrapper, instanceWrapper);
      return instanceWrapper as InstanceWrapper<T>;
    }
    return this.lookupComponentInParentModules(
      dependencyContext,
      moduleRef,
      wrapper,
      contextId,
      keyOrIndex,
    );
  }
  public async lookupComponentInParentModules<T = unknown>(
    dependencyContext: InjectorDependencyContext,
    moduleRef: Module,
    wrapper: InstanceWrapper<T>,
    contextId = STATIC_CONTEXT,
    keyOrIndex?: string | number,
  ): Promise<InstanceWrapper<T>> {
    const instanceWrapper = await this.lookupComponentInImports<T>(
      moduleRef,
      dependencyContext.name,
      wrapper,
      [],
      contextId,
      keyOrIndex,
    );
    if (isNil(instanceWrapper)) {
      throw new UnknownDependencyError(
        wrapper.name,
        dependencyContext,
        moduleRef,
      );
    }
    return instanceWrapper;
  }
  public async lookupComponentInImports<T>(
    moduleRef: Module,
    name: ProviderStaticToken,
    wrapper: InstanceWrapper,
    moduleRegistry: string[] = [],
    contextId = STATIC_CONTEXT,
    keyOrIndex?: string | number,
    isTraversing?: boolean,
  ): Promise<InstanceWrapper<T> | null> {
    let instanceWrapperRef: InstanceWrapper<T> = null;
    const imports = moduleRef.imports;
    let children = [...imports.values()];

    if (isTraversing) {
      const contextModuleExports = moduleRef.exports;
      children = children.filter((child) =>
        contextModuleExports.has(child.metatype && child.metatype.name),
      );
    }

    for (const relatedModule of children) {
      if (moduleRegistry.includes(relatedModule.id)) {
        continue;
      }
      moduleRegistry.push(relatedModule.id);
      const { providers, exports } = relatedModule;
      if (!exports.has(name) || !providers.has(name)) {
        const instanceRef = await this.lookupComponentInImports<T>(
          relatedModule,
          name,
          wrapper,
          moduleRegistry,
          contextId,
          keyOrIndex,
          true,
        );
        if (instanceRef) {
          this.addDependencyMetadata(keyOrIndex, wrapper, instanceRef);
          return instanceRef;
        }
        continue;
      }
      instanceWrapperRef = providers.get(name) as InstanceWrapper<T>;
      this.addDependencyMetadata(keyOrIndex, wrapper, instanceWrapperRef);

      const instanceHost = instanceWrapperRef.getInstanceByContextId(contextId);
      if (!instanceHost.isResolved) {
        await this.loadProvider(instanceWrapperRef, relatedModule, contextId);
        break;
      }
    }
    return instanceWrapperRef;
  }
  private addDependencyMetadata(
    keyOrIndex: number | string,
    hostWrapper: InstanceWrapper,
    instanceWrapper: InstanceWrapper,
  ): void {
    isString(keyOrIndex)
      ? hostWrapper.addPropertiesMetadata(keyOrIndex, instanceWrapper)
      : hostWrapper.addCtorMetadata(keyOrIndex, instanceWrapper);
  }
}
