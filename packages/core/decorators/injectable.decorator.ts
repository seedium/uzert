import { SCOPE_OPTIONS_METADATA } from '../constants';

export function Injectable(options?: Record<string, unknown>): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(SCOPE_OPTIONS_METADATA, options, target);
  };
}
