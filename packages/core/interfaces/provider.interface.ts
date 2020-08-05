import { Abstract } from './abstract.interface';

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface FactoryProvider<T = any> {
  /**
   * Injection token
   */
  provide: string | symbol | Type<any> | Abstract<any> | Function;
  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory: (...args: any[]) => T | Promise<T>;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: Array<Type<any> | string | symbol | Abstract<any> | Function>;
}

export type Provider<T = any> = Type<T> | FactoryProvider<T>;
