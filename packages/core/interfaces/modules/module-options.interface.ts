import { Provider, Type } from '../provider.interface';
import { RouteModule } from '../router.interface';
import { DynamicModule } from './dynamic-module.interface';
import { Abstract } from '../abstract.interface';

export interface ModuleOptions {
  imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule>>;
  providers?: Provider[];
  controllers?: Type<any>[];
  routes?: Type<RouteModule>[];
  exports?: Array<DynamicModule | Promise<DynamicModule> | string | symbol | Provider | Abstract<any> | Function>;
}

export interface ProviderName {
  name?: string | symbol;
}
