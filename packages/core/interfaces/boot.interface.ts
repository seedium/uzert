import { IProvider } from '../interfaces';

export interface IProviderLoaders {
  [name: string]: [IProvider, ...any[]];
}
