import { Provider } from './provider.interface';

export interface ModuleOptions {
  providers?: Provider[];
  controllers?: Function[];
  routes?: Function[];
}

export interface ProviderName {
  name?: string | symbol;
}
