export interface IProvider<C extends new (...args: any[]) => ProviderInstance<C>> {
  boot(options?: any, ...args: any[]): void;
}

export interface ProviderInstance<C extends new (...args: any[]) => any> {
  constructor: C;
}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}
