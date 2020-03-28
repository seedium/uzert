import { IProvider } from './provider.interface';

export interface ModuleOptions {
  providers?: IProvider<any>[];
  controllers?: Function[];
}
