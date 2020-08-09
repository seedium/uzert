export interface IConfigLoaderOptions {
  path: string;
  pattern?: string;
}

export interface IConfigLoader {
  importConfigs(
    options?: IConfigLoaderOptions,
  ): Promise<Record<string, unknown>[]>;
}
