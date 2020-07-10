import { isUndefined } from '@uzert/helpers';
import { OPTIONAL_PROPERTY_DEPS_METADATA, OPTIONAL_DEPS_METADATA } from '../constants';

export function Optional() {
  return (target: object, key: string | symbol, index?: number) => {
    if (!isUndefined(index)) {
      const args = Reflect.getMetadata(OPTIONAL_DEPS_METADATA, target) || [];
      Reflect.defineMetadata(OPTIONAL_DEPS_METADATA, [...args, index], target);
      return;
    }
    const properties = Reflect.getMetadata(OPTIONAL_PROPERTY_DEPS_METADATA, target.constructor) || [];
    Reflect.defineMetadata(OPTIONAL_PROPERTY_DEPS_METADATA, [...properties, key], target.constructor);
  };
}
