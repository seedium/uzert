export { Ajv, ErrorObject, KeywordDefinition } from 'ajv';
import { KeywordDefinition } from 'ajv';
// copy from fastify reference

export interface IExtendSchema {
  extends?: {
    key: string;
    listSchema?: JSONSchema;
    listKey?: string;
    fallback?: JSONSchema;
    schemas: {
      [key: string]: JSONSchema;
    };
  };
}

export interface IRequestSchema {
  summary: string;
  tags: string[];
  description?: string;
  consumes?: string[];
  security?: [{ [securityLabel: string]: string[] }];
  body?: JSONSchema;
  querystring?: JSONSchema;
  params?: JSONSchema;
  headers?: JSONSchema;
}

export interface IResponseSchema {
  [code: number]: JSONSchema | IExtendSchema;
  [code: string]: JSONSchema | IExtendSchema;
}

export interface RouteSchema extends IRequestSchema {
  response?: IResponseSchema;
}

// SchemaGenerator

export interface ISwaggerRouteInput {
  schemaRef: string;
  url: string;
  method: string;
}

export interface ISchemaMethod {
  schemaRef: string;
  method: string;
}

export interface ISwaggerRoute {
  url: string;
  data: ISchemaMethod[];
}

export interface ISharedRefName {
  name: string;
  schemaRef: string;
}

export interface ISwaggerOptionsContact {
  name?: string;
  email: string;
  url?: string;
}

export interface ISwaggerOptionsInfo {
  description: string;
  version: string;
  title: string;
  contact: ISwaggerOptionsContact;
}

export interface ISwaggerOptionsServer {
  description?: string;
  url: string;
}

export interface ISwaggerTag {
  name: string;
}

export interface ISwaggerOptions {
  openapi: '3.0.0';
  info: ISwaggerOptionsInfo;
  servers: ISwaggerOptionsServer[];
  tags: ISwaggerTag[];
  components?: object;
}

export interface ISwaggerObj extends ISwaggerOptions {
  paths: any;
  components: any;
}

export interface IPluginSchemaGeneratorOptions {
  swaggerOptions?: ISwaggerOptions;
  routePrefix?: string;
  exposeRoute?: boolean;
}
