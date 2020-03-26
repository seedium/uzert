export interface IStore {
  [namespace: string]: object;
}

export interface IConfigBootSpec {
  [namespace: string]: Promise<any>;
}

export interface IConfigOptions {
  basePath?: string;
  pattern?: string;
  useAbsolute?: boolean;
}

export { default } from './Config';
