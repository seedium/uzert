import { ROUTER_OPTIONS, ROUTER_INSTANCE } from '@uzert/core/constants';
import { extendObjectMetadata } from '@uzert/core/utils';
import { RawServerBase, RouteShorthandOptions } from 'fastify';

export function Controller(options: RouteShorthandOptions<RawServerBase> = {}) {
  return (
    target: unknown,
    key?: string | symbol,
    // eslint-disable-next-line
    descriptor?: TypedPropertyDescriptor<any>,
    // eslint-disable-next-line
  ): TypedPropertyDescriptor<any> | never => {
    if (!descriptor) {
      throw new Error('Controller decorator cannot be used on class');
    }
    Reflect.defineMetadata(ROUTER_INSTANCE, target, descriptor.value);
    extendObjectMetadata(ROUTER_OPTIONS, options, descriptor.value);
    return descriptor;
  };
}
