// @ts-ignore
import * as AjvMergePatch from 'ajv-merge-patch';
import * as Ajv from 'ajv';
import { IProvider } from '@uzert/core';
import { Request, Response } from '@uzert/app';
import { isPlainObject, isString } from '@uzert/helpers';
// errors
import AjvNotBootedError from './errors/AjvNotBootedError';
import UnknownModelNameError from './errors/UnknownModelNameError';
import SchemaNotFoundError from './errors/SchemaNotFoundError';
// types
import {
  IKeywordDefinitions,
  IRefResult,
  ISchemaDefinitions,
  controllers,
} from './index';
// utils
import {
  capitalize,
  keywords as customKeywords,
  validateRequest,
  validateResponse,
} from './utils';
import SchemasGenerator from './SchemaGenerator';
import SchemasGeneratorNotBootedError from './errors/SchemaGeneratorNotBootedError';

export class Validation implements IProvider {
  public sharedKey = 'shared';

  protected _ajv?: Ajv.Ajv;

  protected _schemasGenerator?: SchemasGenerator;

  get ajv(): Ajv.Ajv {
    if (!this._ajv) {
      throw new AjvNotBootedError();
    }

    return this._ajv;
  }

  get schemasGenerator(): SchemasGenerator {
    if (!this._schemasGenerator) {
      throw new SchemasGeneratorNotBootedError();
    }

    return this._schemasGenerator;
  }

  constructor(sharedSchemas?: any, keywords?: IKeywordDefinitions) {
    this.createAjv(sharedSchemas, keywords);
  }

  public createAjv(sharedSchemas?: any, keywords?: IKeywordDefinitions): void {
    if (!this._ajv) {
      this._ajv = new Ajv({
        removeAdditional: true,
        useDefaults: true,
        coerceTypes: true,
        allErrors: true,
        nullable: true,
      });
      AjvMergePatch(this._ajv);
    }

    this.addSharedSchemas(sharedSchemas);
    this.addCustomKeywords(keywords);
    if (!this._schemasGenerator) {
      this._schemasGenerator = new SchemasGenerator(this._ajv);
    }
  }

  public boot(sharedSchemas?: any, keywords?: IKeywordDefinitions) {
    this.createAjv(sharedSchemas, keywords);
  }

  public unBoot(): void {
    this._ajv = undefined;
  }

  public getSchemaRef(scope: string, key: string): string {
    scope = capitalize(scope);
    key = capitalize(key);
    return `${scope}${key}`;
  }

  public addSchema(scope: string, key: string, schema = {}) {
    if (!this._ajv) {
      throw new AjvNotBootedError();
    }
    scope = capitalize(scope);
    key = capitalize(key);

    const schemaRef = this.getSchemaRef(scope, key);

    schema = {
      $id: schemaRef,
      ...schema,
    };

    if (scope.toLowerCase() !== controllers) {
      this.schemasGenerator.addSharedSchema({
        name: key,
        schemaRef,
      });
    }

    this._ajv.addSchema(schema);
  }

  public getSchema(scope: string, key: string): any {
    const compiler = this.getSchemaCompiler(scope, key);

    if (!compiler) {
      throw new SchemaNotFoundError(key);
    }

    return compiler.schema;
  }

  public getSchemaCompiler(scope: string, key: string): Ajv.ValidateFunction {
    if (!this._ajv) {
      throw new AjvNotBootedError();
    }

    const schemaRef = this.getSchemaRef(scope, key);

    return this._ajv.getSchema(schemaRef);
  }

  public getModelSchemaRef(model: any | string): IRefResult {
    if (isString(model)) {
      return {
        $ref: this.getSchemaRef('models', model),
      };
    } else if (isString(model.name)) {
      return {
        $ref: this.getSchemaRef('models', model.name),
      };
    }

    throw new UnknownModelNameError();
  }

  public getModelSchema(model: any | string): any {
    if (isString(model)) {
      return this.getSchema('models', model);
    } else if (isString(model.name)) {
      return this.getSchema('models', model.name);
    }

    throw new UnknownModelNameError();
  }

  public getSharedSchemaRef(key: string): IRefResult {
    return {
      $ref: this.getSchemaRef(this.sharedKey, key),
    };
  }

  public getSharedSchema(key: string): any {
    return this.getSchema(this.sharedKey, key);
  }

  public validateRequest = async (req: Request, res: Response) => {
    return validateRequest(this.ajv, req, res);
  };

  public validateResponse = async (
    req: Request,
    res: Response,
    payload: any,
  ) => {
    return validateResponse(this.ajv, req, res, payload);
  };

  protected addSharedSchemas(schemas?: ISchemaDefinitions) {
    if (schemas && isPlainObject(schemas)) {
      for (const schema in schemas) {
        if (schemas.hasOwnProperty(schema)) {
          this.addSchema(this.sharedKey, schema, schemas[schema]);
        }
      }
    }
  }

  protected addCustomKeywords(keywords?: IKeywordDefinitions) {
    let keywordsToAdd: IKeywordDefinitions = customKeywords;

    if (keywords && isPlainObject(keywords)) {
      keywordsToAdd = {
        ...keywords,
        ...keywordsToAdd,
      };
    }

    for (const keyword in keywordsToAdd) {
      if (
        keywordsToAdd.hasOwnProperty(keyword) &&
        !this.ajv.getKeyword(keyword)
      ) {
        this.ajv.addKeyword(keyword, keywordsToAdd[keyword]);
      }
    }
  }
}

export default new Validation();
