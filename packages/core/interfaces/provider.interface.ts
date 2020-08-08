import { Abstract } from './abstract.interface';

export type ProviderToken = string | symbol | Type<any> | Abstract<any> | Function;

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export interface FactoryProvider<T = any> {
  /**
   * Injection token
   */
  provide: ProviderToken;
  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory: (...args: any[]) => T | Promise<T>;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: Array<ProviderToken>;
}

export interface ClassProvider<T = any> {
  /**
   * Injection token
   */
  provide: ProviderToken;
  /**
   * Type (class name) of provider (instance to be injected).
   */
  useClass: Type<T>;
}

export interface ValueProvider<T = any> {
  /**
   * Injection token
   */
  provide: ProviderToken;
  /**
   * Instance of a provider to be injected.
   */
  useValue: T;
}

export type Provider<T = any> = Type<T> | FactoryProvider<T> | ClassProvider<T> | ValueProvider<T>;
