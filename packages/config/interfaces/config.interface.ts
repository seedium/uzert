export interface IStore {
  [namespace: string]: object;
}

export interface IConfigBootSpec {
  [namespace: string]: Promise<any>;
}

export interface IConfigOptions {
  path: string;
  pattern?: string;
}
