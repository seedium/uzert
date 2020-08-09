export function extendArrayMetadata<T extends Array<unknown>>(
  key: string,
  metadata: T,
  target: unknown,
): void {
  const previousValue = Reflect.getMetadata(key, target) || [];
  const value = [...metadata, ...previousValue];
  Reflect.defineMetadata(key, value, target);
}
