import { Type } from '../provider.interface';
import { ModuleOptions } from './module-options.interface';
import { Abstract } from '../abstract.interface';

export interface DynamicModule<T = unknown> extends ModuleOptions {
  module: Type<T> | Abstract<unknown>;
}
