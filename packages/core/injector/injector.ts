import { isUndefined, isNil, isString, isFunction, isObjectLike } from '@uzert/helpers';
import { InstanceWrapper } from './instance-wrapper';
import { STATIC_CONTEXT } from './injector.constants';
import {
  IInjectable,
  InstancePerContext,
  Type,
  InjectorDependencyContext,
  PropertyDependency,
  ContextId,
} from '../interfaces';
import { Module } from './module';
import {
  METADATA_PARAMTYPES,
  SELF_DECLARED_DEPS_METADATA,
  PROPERTY_DEPS_METADATA,
  OPTIONAL_PROPERTY_DEPS_METADATA,
} from '../constants';
import { UndefinedDependencyError, UnknownDependencyError } from '../errors';

export class Injector {
  public loadPrototype<T>(
    { name }: InstanceWrapper<T>,
    collection: Map<string, InstanceWrapper<T>>,
    contextId = STATIC_CONTEXT,
  ) {
    if (!collection) {
      return;
    }

    const target = collection.get(name);
    const instance = target.createPrototype(contextId);

    if (instance) {
      const wrapper = new InstanceWrapper({
        ...target,
        instance,
      });

      collection.set(name, wrapper);
    }
  }

  public async loadPerContext<T = any>(
    instance: T,
    moduleRef: Module,
    collection: Map<string, InstanceWrapper>,
    ctx: ContextId,
    wrapper?: InstanceWrapper,
  ): Promise<T> {
    if (!wrapper) {
      const ctor = instance.constructor;
      wrapper = collection.get(ctor && ctor.name);
    }

    await this.loadInstance(wrapper, collection, moduleRef, ctx);

    const host = wrapper.getInstanceByContextId(ctx);

    return host && (host.instance as T);
  }

  public async loadProvider(wrapper: InstanceWrapper<IInjectable>, moduleRef: Module, contextId = STATIC_CONTEXT) {
    const providers = moduleRef.providers;

    await this.loadInstance<IInjectable>(wrapper, providers, moduleRef, contextId);
  }

  public async loadInstance<T>(
    wrapper: InstanceWrapper<T>,
    collection: Map<string, InstanceWrapper>,
    moduleRef: Module,
    contextId = STATIC_CONTEXT,
  ) {
    const instanceHost = wrapper.getInstanceByContextId(contextId);

    if (instanceHost.isPending) {
      return instanceHost.donePromise;
    }

    const done = this.applyDoneHook(instanceHost);
    const { name } = wrapper;

    const targetWrapper = collection.get(name);

    if (isUndefined(targetWrapper)) {
      throw new Error(``);
    }

    if (instanceHost.isResolved) {
      return done();
    }

    const callback = async (instances: unknown[]) => {
      const properties = await this.resolveProperties(wrapper, moduleRef, contextId);
      const instance = await this.instantiateClass(instances, wrapper, targetWrapper, contextId);
      this.applyProperties(instance, properties);
      done();
    };

    await this.resolveConstructorParams<T>(wrapper, moduleRef, callback, contextId);
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
    contextId = STATIC_CONTEXT,
  ): Promise<PropertyDependency[]> {
    const metadata = wrapper.getPropertiesMetadata();

    if (metadata && contextId !== STATIC_CONTEXT) {
      return;
    }

    const properties = this.reflectProperties(wrapper.metatype as Type<any>);
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

          if (!paramWrapper) {
            return undefined;
          }

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

  public applyProperties<T = any>(instance: T, properties: PropertyDependency[]): void {
    if (!isObjectLike(instance)) {
      return undefined;
    }

    properties.filter((item) => !isNil(item.instance)).forEach((item) => (instance[item.key] = item.instance));
  }

  public async instantiateClass<T = any>(
    instances: any[],
    wrapper: InstanceWrapper,
    targetMetatype: InstanceWrapper,
    contextId = STATIC_CONTEXT,
  ): Promise<T> {
    const { metatype } = wrapper;
    const instanceHost = targetMetatype.getInstanceByContextId(contextId);

    instanceHost.instance = new (metatype as Type<any>)(...instances);

    instanceHost.isResolved = true;
    return instanceHost.instance;
  }

  public async resolveConstructorParams<T>(
    wrapper: InstanceWrapper<T>,
    moduleRef: Module,
    callback: (args: unknown[]) => void,
    contextId = STATIC_CONTEXT,
  ) {
    const dependencies = this.reflectConstructorParams(wrapper.metatype as Type<any>);

    let isResolved = true;

    const resolveParam = async (param: unknown, index: number) => {
      try {
        const paramWrapper = await this.resolveSingleParam<T>(
          wrapper,
          param,
          { index, dependencies },
          moduleRef,
          contextId,
          index,
        );

        const instanceHost = paramWrapper.getInstanceByContextId(contextId);

        if (!instanceHost.isResolved) {
          isResolved = false;
        }

        return instanceHost && instanceHost.instance;
      } catch (err) {
        return undefined;
      }
    };

    const instances = await Promise.all(dependencies.map(resolveParam));
    isResolved && (await callback(instances));
  }

  public reflectConstructorParams<T>(type: Type<T>): any[] {
    const paramtypes = Reflect.getMetadata(METADATA_PARAMTYPES, type) || [];
    const selfParams = this.reflectSelfParams<T>(type);

    selfParams.forEach(({ index, param }) => (paramtypes[index] = param));
    return paramtypes;
  }

  public reflectProperties<T>(type: Type<T>): PropertyDependency[] {
    const properties = Reflect.getMetadata(PROPERTY_DEPS_METADATA, type) || [];
    const optionalKeys: string[] = Reflect.getMetadata(OPTIONAL_PROPERTY_DEPS_METADATA, type) || [];

    return properties.map((item: any) => ({
      ...item,
      name: item.type,
      isOptional: optionalKeys.includes(item.key),
    }));
  }

  public reflectSelfParams<T>(type: Type<T>): any[] {
    return Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, type) || [];
  }

  public async resolveSingleParam<T>(
    wrapper: InstanceWrapper<T>,
    param: Type<any> | string | symbol | any,
    dependencyContext: InjectorDependencyContext,
    moduleRef: Module,
    contextId = STATIC_CONTEXT,
    keyOrIndex?: string | number,
  ) {
    if (isUndefined(param)) {
      throw new UndefinedDependencyError(wrapper.name, dependencyContext, moduleRef);
    }

    const token = this.resolveParamToken(wrapper, param);

    return this.resolveComponentInstance<T>(
      moduleRef,
      isFunction(token) ? (token as Type<any>).name : token,
      dependencyContext,
      wrapper,
      contextId,
      keyOrIndex,
    );
  }

  public resolveParamToken<T>(wrapper: InstanceWrapper<T>, param: Type<any> | string | symbol | any) {
    if (!param.forwardRef) {
      return param;
    } else {
      throw new Error('Resolve param token error');
    }
  }

  public async resolveComponentInstance<T>(
    moduleRef: Module,
    name: any,
    dependencyContext: InjectorDependencyContext,
    wrapper: InstanceWrapper<T>,
    contextId = STATIC_CONTEXT,
    keyOrIndex?: string | number,
  ): Promise<InstanceWrapper> {
    const providers = moduleRef.providers;
    const instanceWrapper = await this.lookupComponent(
      providers,
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
    contextId = STATIC_CONTEXT,
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

  public async lookupComponent<T = any>(
    providers: Map<string | symbol, InstanceWrapper>,
    moduleRef: Module,
    dependencyContext: InjectorDependencyContext,
    wrapper: InstanceWrapper<T>,
    contextId = STATIC_CONTEXT,
    keyOrIndex?: string | number,
  ): Promise<InstanceWrapper<T>> {
    const { name } = dependencyContext;

    if (wrapper && wrapper.name === name) {
      throw new UnknownDependencyError(wrapper.name, dependencyContext, moduleRef);
    }

    if (providers.has(name)) {
      const instanceWrapper = providers.get(name);
      this.addDependencyMetadata(keyOrIndex, wrapper, instanceWrapper);
      return instanceWrapper;
    }
  }

  private addDependencyMetadata(
    keyOrIndex: number | string,
    hostWrapper: InstanceWrapper,
    instanceWrapper: InstanceWrapper,
  ) {
    isString(keyOrIndex)
      ? hostWrapper.addPropertiesMetadata(keyOrIndex, instanceWrapper)
      : hostWrapper.addCtorMetadata(keyOrIndex, instanceWrapper);
  }
}
