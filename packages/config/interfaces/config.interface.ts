export interface IStore {
  [namespace: string]: object;
}

export interface IConfigBootSpec {
  [namespace: string]: string;
}

export interface IConfigOptions {
  path: string;
  pattern?: string;
}
