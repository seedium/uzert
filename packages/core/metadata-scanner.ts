import { IInjectable } from './interfaces';
import { isNil, isFunction, isConstructor } from '@uzert/helpers';
import iterate from 'iterare';

export class MetadataScanner {
  public static scanFromPrototype<T extends IInjectable, R = any>(
    prototype: object,
    callback: (name: string) => R,
  ): R[] {
    const methodNames = new Set(this.getAllFilteredMethodNames(prototype));
    return iterate(methodNames)
      .map(callback)
      .filter((metadata) => !isNil(metadata))
      .toArray();
  }

  static *getAllFilteredMethodNames(
    prototype: object,
  ): IterableIterator<string> {
    const isMethod = (prop: string) => {
      const descriptor = Object.getOwnPropertyDescriptor(prototype, prop);
      if (descriptor.set || descriptor.get) {
        return false;
      }
      return !isConstructor(prop) && isFunction(prototype[prop]);
    };
    do {
      yield* iterate(Object.getOwnPropertyNames(prototype))
        .filter(isMethod)
        .toArray();
    } while (
      (prototype = Reflect.getPrototypeOf(prototype)) &&
      prototype !== Object.prototype
    );
  }
}
