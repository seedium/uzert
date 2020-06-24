import { FactoryProvider } from '../interfaces';

export const isHttpAdapterCustomProvider = <T = any>(object: any): object is FactoryProvider<T> => {
  return object.useFactory && object.provide;
};
