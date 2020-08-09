import { PIPES_METADATA } from '../../constants';
import { FactoryProvider, Pipe, Type } from '../../interfaces';
import { extendArrayMetadata } from '../../utils';

export function UsePipe(pipe: Type<Pipe> | FactoryProvider): MethodDecorator {
  return (
    target: unknown,
    key?: string | symbol,
    /* eslint-disable-next-line*/
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    if (!descriptor) {
      throw new Error(`@UsePipe doesn't support decoration on the class`);
    }
    extendArrayMetadata(PIPES_METADATA, [pipe], descriptor.value);
    return descriptor;
  };
}
