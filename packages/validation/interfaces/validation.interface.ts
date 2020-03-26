export type JSONSchema = any;

export interface IKeywordDefinitions {
  [name: string]: KeywordDefinition;
}

export interface IRefResult {
  $ref: string;
}

export interface ISchemaDefinitions {
  [name: string]: any;
}
