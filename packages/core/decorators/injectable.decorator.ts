import { SCOPE_OPTIONS_METADATA } from '../constants';

export function Injectable(options?: any): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  };
}
