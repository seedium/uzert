import { Type } from './provider.interface';

export type InjectorDependency = Type<unknown> | Function | string | symbol;

/**
 * Context of a dependency which gets injected by
 * the injector
 */
export interface InjectorDependencyContext {
  /**
   * The name of the property key (property-based injection)
   */
  key?: string | symbol;
  /**
   * The name of the function or injection token
   */
  name?: string | symbol;
  /**
   * The index of the dependency which gets injected
   * from the dependencies array
   */
  index?: number;
  /**
   * The dependency array which gets injected
   */
  dependencies?: InjectorDependency[];
}

export interface PropertyDependency {
  key: string;
  name: InjectorDependency;
  isOptional?: boolean;
  instance?: unknown;
  type: Type<unknown>;
}

export interface SelfDeclaredMetadata<T = unknown> {
  param?: string | T;
  type?: string;
  index?: number;
  key?: string;
}
