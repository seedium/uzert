import { isUndefined, isFunction } from '@uzert/helpers';
import {
  PROPERTY_DEPS_METADATA,
  SELF_DECLARED_DEPS_METADATA,
} from '../constants';
import { SelfDeclaredMetadata } from '../interfaces';

export function Inject<T = unknown>(token?: T) {
  return (target: unknown, key: string | symbol, index?: number): void => {
    token = token || Reflect.getMetadata('design:type', target, key);
    const type =
      token && isFunction(token)
        ? ((token as unknown) as Function).name
        : token;

    if (!isUndefined(index)) {
      let dependencies: SelfDeclaredMetadata[] =
        Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target) || [];

      dependencies = [...dependencies, { index, param: type }];
      Reflect.defineMetadata(SELF_DECLARED_DEPS_METADATA, dependencies, target);
      return;
    }

    let properties =
      Reflect.getMetadata(PROPERTY_DEPS_METADATA, target.constructor) || [];

    properties = [...properties, { key, type }];
    Reflect.defineMetadata(
      PROPERTY_DEPS_METADATA,
      properties,
      target.constructor,
    );
  };
}
