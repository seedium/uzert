import { INSTANCE_ID_SYMBOL, INSTANCE_METADATA_SYMBOL } from '../constants';
import { getRandomString } from '../utils/get-random-string';
import { ContextId, InstancePerContext, Type, InstanceMetadataStore, PropertyMetadata } from '../interfaces';
import { STATIC_CONTEXT } from './injector.constants';
import { Module } from './module';

export class InstanceWrapper<T = any> {
  public readonly name: any;
  public readonly async?: boolean;
  public readonly host?: Module;

  private readonly values = new WeakMap<ContextId, InstancePerContext<T>>();
  private readonly [INSTANCE_METADATA_SYMBOL]: InstanceMetadataStore = {};

  public metatype: Type<T> | Function;

  constructor(metadata: Partial<InstanceWrapper<T>> & Partial<InstancePerContext<T>> = {}) {
    this[INSTANCE_ID_SYMBOL] = getRandomString();
    this.initialize(metadata);
  }

  get id(): string {
    return this[INSTANCE_ID_SYMBOL];
  }

  get instance(): T {
    const instancePerContext = this.getInstanceByContextId(STATIC_CONTEXT);
    return instancePerContext.instance;
  }

  private initialize(metadata: Partial<InstanceWrapper<T>> & Partial<InstancePerContext<T>>) {
    const { instance, isResolved, ...wrapperPartial } = metadata;
    Object.assign(this, wrapperPartial);

    this.setInstanceByContextId(STATIC_CONTEXT, {
      instance,
      isResolved,
    });
  }

  public createPrototype(contextId: ContextId) {
    const host = this.getInstanceByContextId(contextId);

    if (!this.isNewable() || host.isResolved) {
      return;
    }

    return Object.create(this.metatype.prototype);
  }

  public getInstanceByContextId(contextId: ContextId): InstancePerContext<T> {
    const instancePerContext = this.values.get(contextId);
    return instancePerContext ? instancePerContext : this.cloneStaticInstance(contextId);
  }

  public cloneStaticInstance(contextId: ContextId): InstancePerContext<T> {
    const staticInstance = this.getInstanceByContextId(STATIC_CONTEXT);

    if (this.isDependencyTreeStatic()) {
      return staticInstance;
    }

    const instancePerContext: InstancePerContext<T> = {
      ...staticInstance,
      instance: undefined,
      isResolved: false,
      isPending: false,
    };
    if (this.isNewable()) {
      instancePerContext.instance = Object.create(this.metatype.prototype);
    }
    this.setInstanceByContextId(contextId, instancePerContext);
    return instancePerContext;
  }

  public isDependencyTreeStatic(): boolean {
    return true;
  }

  private isNewable(): boolean {
    return this.metatype && this.metatype.prototype;
  }

  public setInstanceByContextId(contextId: ContextId, value: InstancePerContext<T>) {
    this.values.set(contextId, value);
  }

  public getPropertiesMetadata(): PropertyMetadata[] {
    return this[INSTANCE_METADATA_SYMBOL].properties;
  }

  public addPropertiesMetadata(key: string, wrapper: InstanceWrapper) {
    if (!this[INSTANCE_METADATA_SYMBOL].properties) {
      this[INSTANCE_METADATA_SYMBOL].properties = [];
    }
    this[INSTANCE_METADATA_SYMBOL].properties.push({
      key,
      wrapper,
    });
  }

  public addCtorMetadata(index: number, wrapper: InstanceWrapper) {
    if (!this[INSTANCE_METADATA_SYMBOL].dependencies) {
      this[INSTANCE_METADATA_SYMBOL].dependencies = [];
    }
    this[INSTANCE_METADATA_SYMBOL].dependencies[index] = wrapper;
  }
}
