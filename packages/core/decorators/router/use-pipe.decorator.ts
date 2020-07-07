import { PIPES_METADATA } from '../../constants';
import { FactoryProvider, Pipe, Type } from '../../interfaces';
import { extendArrayMetadata } from '../../utils/extend-array-metadata';

export function UsePipe(pipe: Type<Pipe> | FactoryProvider): ClassDecorator & MethodDecorator {
  return (target: any, key?: string | symbol, descriptor?: TypedPropertyDescriptor<any>) => {
    if (descriptor) {
      extendArrayMetadata(PIPES_METADATA, [pipe], descriptor.value);
      return descriptor;
    }
    return target;
  };
}
