import * as Ajv from 'ajv';
import * as YAML from 'yaml';
import * as fs from 'fs';
import { getAbsoluteFSPath } from 'swagger-ui-dist';
// types
import { ISwaggerRouteInput, ISwaggerRoute, ISharedRefName, ISwaggerOptions, ISwaggerObj } from '../interfaces';
// errors
import {
  SchemasGeneratorInvalidDataError,
  SchemaNotFoundError,
  SwaggerNoOptionsError,
  SchemaGeneratorMergeError,
} from '../errors';

export default class SchemaGeneratorProvider {
  public static docFileName: string = 'doc.yaml';
  public swaggerAbsoluteFSPath = getAbsoluteFSPath();

  protected _ajv: Ajv.Ajv;
  protected _routeData: ISwaggerRoute[];
  protected _swaggerOptions?: ISwaggerOptions;
  protected _sharedRefNames: ISharedRefName[];
  protected _removeProperties: string[];
  protected _prefix?: string;

  constructor(ajv: any, removeProperties: string[] = ['$id', 'additionalProperties', 'objectId']) {
    this._ajv = ajv;
    this._routeData = [];
    this._sharedRefNames = [];
    this._removeProperties = removeProperties;
  }

  public addRouteSchema(data: ISwaggerRouteInput) {
    if (!data.url || !data.method || !data.schemaRef) {
      throw new SchemasGeneratorInvalidDataError();
    }

    if (!this._ajv.getSchema(data.schemaRef)) {
      return;
    }

    data.method = data.method.toLowerCase();
    data.url = this.modifyUrl(data.url);

    const routeDataIndex = this._routeData.findIndex((f) => f.url === data.url);

    if (routeDataIndex === -1) {
      this._routeData.push({
        url: data.url,
        data: [
          {
            schemaRef: data.schemaRef,
            method: data.method,
          },
        ],
      });
    } else {
      this._routeData[routeDataIndex].data.push({
        schemaRef: data.schemaRef,
        method: data.method,
      });
    }
  }

  public addSharedSchema(data: ISharedRefName) {
    const isExists = this._sharedRefNames.findIndex((f) => f.schemaRef === data.schemaRef) === -1;

    if (isExists) {
      this._sharedRefNames.push(data);
    }
  }

  public setSwaggerOptions(data: ISwaggerOptions) {
    data.openapi = '3.0.0';
    this._swaggerOptions = data;
  }

  public getParameters(data: any, type: string) {
    return Object.keys(data.properties).map((property) => {
      return {
        in: type,
        name: property,
        required: data.required && data.required.findIndex((f: string) => f === property) !== -1,
        schema: data.properties[property],
      };
    });
  }

  public generateSwaggerObject() {
    if (!this._swaggerOptions) {
      return;
    }

    const swaggerObj: ISwaggerObj = {
      ...this._swaggerOptions,
      paths: {},
      components: this._swaggerOptions.components ? this._swaggerOptions.components : {},
    };

    this._routeData.forEach((item) => {
      const swaggerData: any = {};

      item.data.forEach((data, index) => {
        const schema = this.getSchema(data.schemaRef);

        if (index === 0 && schema.params) {
          swaggerData.parameters = this.getParameters(schema.params, 'path');
        }

        const methodLevel: any = {
          parameters: [],
        };

        if (schema.tags) {
          methodLevel.tags = schema.tags;
        }

        if (schema.summary) {
          methodLevel.summary = schema.summary;
        }

        if (schema.description) {
          methodLevel.description = schema.description;
        }

        if (schema.security) {
          methodLevel.security = schema.security;
        }

        if (schema.body) {
          const bodySchema: any = {};

          if (schema.body.type) {
            bodySchema.type = schema.body.type;
          }

          if (schema.body.oneOf) {
            bodySchema.oneOf = schema.body.oneOf;
          } else if (schema.body.anyOf) {
            bodySchema.anyOf = schema.body.anyOf;
          } else if (schema.body.allOf) {
            bodySchema.allOf = schema.body.allOf;
          } else {
            const properties: any = {};

            Object.keys(schema.body.properties).forEach((property) => {
              properties[property] = schema.body.properties[property];
            });

            bodySchema.properties = properties;

            if (schema.body.required) {
              bodySchema.required = schema.body.required;
            }
          }

          const contentType =
            Array.isArray(schema.consumes) && schema.consumes.lenth > 0 ? schema.consumes[0] : 'application/json';

          methodLevel.requestBody = {
            content: {
              [contentType]: {
                schema: bodySchema,
              },
            },
          };
        }

        if (schema.querystring) {
          methodLevel.parameters.push(...this.getParameters(schema.querystring, 'query'));
        }

        if (schema.headers) {
          methodLevel.parameters.push(...this.getParameters(schema.headers, 'header'));
        }

        methodLevel.responses = {};

        Object.keys(schema.response).forEach((key) => {
          const response: any = {};

          if (schema.response.type) {
            response.type = schema.response.type || 'object';
          }

          response.description = schema.response[key].description || '';

          let schemaResponse: any = {};

          if (schema.response[key].extends && schema.response[key].extends.listSchema) {
            schemaResponse = schema.response[key].extends.listSchema;

            schemaResponse.properties.data.items = {
              oneOf: this.extendToSchemaData(schema.response[key].extends),
            };
          } else if (schema.response[key].extends) {
            schemaResponse.oneOf = this.extendToSchemaData(schema.response[key].extends);
          } else {
            schemaResponse = schema.response[key];
          }

          response.content = {
            'application/json': {
              schema: schemaResponse,
            },
          };

          methodLevel.responses[key] = response;
        });

        swaggerData[data.method] = methodLevel;
      });

      swaggerObj.paths[item.url] = swaggerData;
    });

    const schemas: any = {};

    this._sharedRefNames.forEach((item) => {
      let schema = this.getSchema(item.schemaRef);

      if (schema.$merge) {
        schema = this.mergeSchema(schema);
      }

      schemas[item.name] = schema;
    });

    swaggerObj.components.schemas = schemas;

    this.modifySwaggerObject(swaggerObj);

    return swaggerObj;
  }

  public generateSwaggerJSON() {
    return JSON.stringify(this.generateSwaggerObject());
  }

  public generateSwaggerYAML() {
    return YAML.stringify(this.generateSwaggerObject());
  }

  public setIndexPrefix(prefix: string) {
    this._prefix = prefix;
    const indexFilePath = `${this.swaggerAbsoluteFSPath}/index.html`;
    const replacement = `.${prefix}/`;

    const indexFile = fs.readFileSync(indexFilePath).toString();

    fs.writeFileSync(indexFilePath, indexFile.replace(/(\.\/[^"']+\/)|(\.\/)/g, replacement));
  }

  public async generateSwaggerDoc() {
    const docPath = `${this.swaggerAbsoluteFSPath}/${SchemaGeneratorProvider.docFileName}`;
    const indexFilePath = `${this.swaggerAbsoluteFSPath}/index.html`;

    fs.writeFileSync(docPath, this.generateSwaggerYAML());

    fs.writeFileSync(
      indexFilePath,
      fs
        .readFileSync(indexFilePath)
        .toString()
        .replace(/url: ".*"/, `url: "${this._prefix || ''}/${SchemaGeneratorProvider.docFileName}"`),
    );
  }

  public extendToSchemaData(extend: any) {
    const properties = [];

    if (extend.fallback) {
      properties.push(extend.fallback);
    }

    Object.keys(extend.schemas).forEach((key) => {
      properties.push(extend.schemas[key]);
    });

    return properties;
  }

  public mergeSchema(schema: any) {
    if (!schema.$merge.source.$ref) {
      throw new SchemaGeneratorMergeError();
    }

    let sourceSchema = this.getSchema(schema.$merge.source.$ref);

    if (sourceSchema.$merge) {
      sourceSchema = this.mergeSchema(sourceSchema);
    }

    if (sourceSchema.required && schema.$merge.with.required) {
      sourceSchema.required.push(...schema.$merge.with.required);
    }

    if (sourceSchema.properties && schema.$merge.with.properties) {
      sourceSchema.properties = {
        ...sourceSchema.properties,
        ...schema.$merge.with.properties,
      };
    }

    return sourceSchema;
  }

  protected setSwaggerRef(key: string, obj: any) {
    if (key === '$ref') {
      const sharedRefName = this._sharedRefNames.find((f) => f.schemaRef === obj[key]);

      if (!sharedRefName) {
        throw new SchemaNotFoundError(obj[key]);
      }

      obj[key] = `#/components/schemas/${sharedRefName.name}`;
    }
  }

  protected getSchema(schemaRef: string): any {
    const schema = this._ajv.getSchema(schemaRef);

    if (!schema) {
      throw new SchemaNotFoundError(schemaRef);
    }

    return JSON.parse(JSON.stringify(schema.schema));
  }

  protected checkType(key: string, obj: any) {
    if (key === 'type') {
      if (Array.isArray(obj[key])) {
        obj[key] = obj[key][0];
      }

      if (obj[key] === 'null' || obj[key] === 'undefined') {
        obj[key] = 'string';
      }
    }
  }

  protected removeProps(key: string, obj: any) {
    if (this._removeProperties.find((f) => f === key)) {
      delete obj[key];
    }
  }

  protected modifyUrl(url: string) {
    while (true) {
      let beforeIndex = url.indexOf(':');

      if (beforeIndex === -1) {
        break;
      }

      const before = url.substr(0, beforeIndex);
      const afterAll = url.substr(beforeIndex + 1, url.length - beforeIndex);

      beforeIndex = afterAll.indexOf('/');

      if (beforeIndex === -1) {
        url = `${before}{${afterAll}}`;
      } else {
        const idStr = afterAll.substr(0, beforeIndex);
        const after = afterAll.substr(beforeIndex, afterAll.length);

        url = `${before}{${idStr}}${after}`;
      }
    }

    return url;
  }

  protected modifySwaggerObject(obj: any) {
    for (const key of Object.keys(obj)) {
      this.setSwaggerRef(key, obj);
      this.checkType(key, obj);
      this.removeProps(key, obj);

      if (typeof obj[key] === 'object') {
        this.modifySwaggerObject(obj[key]);
      }
    }
  }
}
