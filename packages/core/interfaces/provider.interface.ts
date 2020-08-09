import { Abstract } from './abstract.interface';

export type ProviderToken = string | symbol | Type<unknown> | Abstract<unknown>;

export interface Type<T> extends Function {
  new (...args: unknown[]): T;
}

export interface FactoryProvider<T = unknown> {
  /**
   * Injection token
   */
  provide: ProviderToken;
  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory: (...args: unknown[]) => T | Promise<T>;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: Array<ProviderToken>;
}

export interface ClassProvider<T = unknown> {
  /**
   * Injection token
   */
  provide: ProviderToken;
  /**
   * Type (class name) of provider (instance to be injected).
   */
  useClass: Type<T>;
}

export interface ValueProvider<T = unknown> {
  /**
   * Injection token
   */
  provide: ProviderToken;
  /**
   * Instance of a provider to be injected.
   */
  useValue: T;
}

export type CustomProvider<T = unknown> =
  | FactoryProvider<T>
  | ClassProvider<T>
  | ValueProvider<T>;

export type Provider<T = unknown> = Type<T> | CustomProvider<T>;
