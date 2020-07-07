import { merge } from '@uzert/helpers';

export function extendObjectMetadata<T extends Record<string, any>>(key: string, metadata: T, target: Function) {
  const previousValue = Reflect.getMetadata(key, target) || {};
  const value = merge(previousValue, metadata);
  Reflect.defineMetadata(key, value, target);
}
