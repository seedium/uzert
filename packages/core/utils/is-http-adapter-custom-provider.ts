import { FactoryProvider } from '../interfaces';

export const isHttpAdapterCustomProvider = <T = unknown>(
  object: unknown,
): object is FactoryProvider<T> => {
  return !!(
    object &&
    (object as FactoryProvider).useFactory &&
    (object as FactoryProvider).provide
  );
};
