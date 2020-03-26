import { IProvider } from "@uzert/core";

export interface IProviderLoaders {
  [name: string]: [IProvider, ...any[]];
}
