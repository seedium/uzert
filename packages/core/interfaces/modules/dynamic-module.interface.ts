import { Type } from '../provider.interface';
import { ModuleOptions } from './module-options.interface';

export interface DynamicModule extends ModuleOptions {
  module: Type<any>;
}
