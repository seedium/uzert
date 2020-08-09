import { Provider, Type } from '../provider.interface';
import { RouteModule } from '../router.interface';
import { DynamicModule } from './dynamic-module.interface';
import { Abstract } from '../abstract.interface';

export interface ModuleOptions {
  imports?: Array<Type<unknown> | DynamicModule | Promise<DynamicModule>>;
  providers?: Provider[];
  controllers?: Type<unknown>[];
  routes?: Type<RouteModule>[];
  exports?: Array<
    | Promise<DynamicModule>
    | DynamicModule
    | string
    | symbol
    | Provider
    | Abstract<unknown>
    | Function
  >;
}

export interface ProviderName {
  name?: string | symbol;
}

export type ProviderStaticToken = string | symbol;
