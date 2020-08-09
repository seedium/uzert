import { isNil } from '@uzert/helpers';
import { INSTANCE_ID_SYMBOL, INSTANCE_METADATA_SYMBOL } from '../constants';
import { getRandomString } from '../utils/get-random-string';
import {
  ContextId,
  InstancePerContext,
  Type,
  InstanceMetadataStore,
  PropertyMetadata,
  ProviderStaticToken,
} from '../interfaces';
import { STATIC_CONTEXT } from './injector.constants';
import { Module } from './module';

export class InstanceWrapper<T = unknown> {
  public readonly name: ProviderStaticToken;
  public readonly host?: Module;
  public readonly async?: boolean;
  private readonly values = new WeakMap<ContextId, InstancePerContext<T>>();
  private readonly [INSTANCE_METADATA_SYMBOL]: InstanceMetadataStore = {};
  public metatype: Type<T> | Function;
  public inject?: (string | symbol | Function | Type<unknown>)[];
  constructor(
    metadata: Partial<InstanceWrapper<T>> & Partial<InstancePerContext<T>> = {},
  ) {
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
  private initialize(
    metadata: Partial<InstanceWrapper<T>> & Partial<InstancePerContext<T>>,
  ) {
    const { instance, isResolved, ...wrapperPartial } = metadata;
    Object.assign(this, wrapperPartial);

    this.setInstanceByContextId(STATIC_CONTEXT, {
      instance,
      isResolved,
    });
  }
  public createPrototype<T = unknown>(contextId: ContextId): T {
    const host = this.getInstanceByContextId(contextId);

    if (!this.isNewable() || host.isResolved) {
      return;
    }

    return Object.create(this.metatype.prototype);
  }
  public getInstanceByContextId(contextId: ContextId): InstancePerContext<T> {
    const instancePerContext = this.values.get(contextId);
    if (!instancePerContext) {
      throw new Error(
        'Instance per context was not found, need implement cloning static instance',
      );
    }
    return instancePerContext;
  }
  private isNewable(): boolean {
    return isNil(this.inject) && this.metatype && this.metatype.prototype;
  }
  public setInstanceByContextId(
    contextId: ContextId,
    value: InstancePerContext<T>,
  ): void {
    this.values.set(contextId, value);
  }
  public getPropertiesMetadata(): PropertyMetadata[] {
    return this[INSTANCE_METADATA_SYMBOL].properties;
  }
  public getEnhancerMetadata(): InstanceWrapper[] {
    return this[INSTANCE_METADATA_SYMBOL].enhancers;
  }
  public addPropertiesMetadata(key: string, wrapper: InstanceWrapper): void {
    if (!this[INSTANCE_METADATA_SYMBOL].properties) {
      this[INSTANCE_METADATA_SYMBOL].properties = [];
    }
    this[INSTANCE_METADATA_SYMBOL].properties.push({
      key,
      wrapper,
    });
  }
  public addCtorMetadata(index: number, wrapper: InstanceWrapper): void {
    if (!this[INSTANCE_METADATA_SYMBOL].dependencies) {
      this[INSTANCE_METADATA_SYMBOL].dependencies = [];
    }
    this[INSTANCE_METADATA_SYMBOL].dependencies[index] = wrapper;
  }
  public addEnhancerMetadata(wrapper: InstanceWrapper): void {
    if (!this[INSTANCE_METADATA_SYMBOL].enhancers) {
      this[INSTANCE_METADATA_SYMBOL].enhancers = [];
    }
    this[INSTANCE_METADATA_SYMBOL].enhancers.push(wrapper);
  }
}
