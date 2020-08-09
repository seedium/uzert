import { Type } from '../provider.interface';
import { ModuleOptions } from './module-options.interface';

export interface DynamicModule<T = unknown> extends ModuleOptions {
  module: Type<T>;
}
