import { isUndefined, isFunction } from '@uzert/helpers';
import {
  PROPERTY_DEPS_METADATA,
  SELF_DECLARED_DEPS_METADATA,
} from '../constants';

export function Inject<T = any>(token?: T) {
  return (target: object, key: string | symbol, index?: number) => {
    token = token || Reflect.getMetadata('design:type', target, key);
    const type =
      token && isFunction(token) ? ((token as any) as Function).name : token;

    if (!isUndefined(index)) {
      let dependencies =
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
