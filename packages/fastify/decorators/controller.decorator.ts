import { ROUTER_OPTIONS, ROUTER_INSTANCE } from '@uzert/core/constants';
import { extendObjectMetadata } from '@uzert/core/utils';
import { RawServerBase, RouteShorthandOptions } from 'fastify';

export function Controller(options: RouteShorthandOptions<RawServerBase> = {}) {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    if (descriptor) {
      Reflect.defineMetadata(ROUTER_INSTANCE, target, descriptor.value);
      extendObjectMetadata(ROUTER_OPTIONS, options, descriptor.value);
      return descriptor;
    }
    return target;
  };
}
