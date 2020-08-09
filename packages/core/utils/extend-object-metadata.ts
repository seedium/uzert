export function extendObjectMetadata<T extends object>(
  key: string,
  metadata: T,
  target: Function,
): void {
  const previousValue = Reflect.getMetadata(key, target) || {};
  const value = {
    ...previousValue,
    ...metadata,
  };
  Reflect.defineMetadata(key, value, target);
}
