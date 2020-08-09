import { IConfigLoaderOptions } from './loaders';

export type IStore = Record<string, unknown>;

export interface IConfigBootSpec {
  [namespace: string]: string;
}

export interface IConfigOptions
  extends Record<string, unknown>,
    IConfigLoaderOptions {}
