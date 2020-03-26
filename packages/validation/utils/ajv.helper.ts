import { Ajv, KeywordDefinition, ValidateFunction } from 'ajv';
import { isPlainObject } from '@uzert/helpers';
import { Request, Response } from '@uzert/app';
// types
import { IRequestSchema, IResponseSchema } from './index';
// errors
import SchemaError from './errors/SchemaError';
import ValidationError from './errors/ValidationError';

const objectIdKeyword: KeywordDefinition = {
  validate(
    toObjectId: boolean,
    data: any,
    parentSchema?: object,
    dataPath?: string,
    parentData?: any | any[],
    parentDataProperty?: any,
  ) {
    if (toObjectId && parentData && parentDataProperty !== undefined) {
      parentData[parentDataProperty] = getObjectId(data);
    } else if (parentData && parentDataProperty !== undefined) {
      parentData[parentDataProperty] = getStringFromObjectId(data);
    }

    return true;
  },
  modifying: true,
  errors: true,
};

export const keywords = {
  objectId: objectIdKeyword,
};

export const validateRequest = (ajv: Ajv, req: Request, res: Response) => {
  const { schemas } = res.context.config;

  if (!schemas) {
    return;
  }

  const {
    request,
  }: {
    request: IRequestSchema;
  } = schemas;

  if (request.body && isPlainObject(request.body)) {
    const compiler = ajv.compile(request.body);

    compiler(req.body);

    if (compiler.errors) {
      const [firstError] = compiler.errors;
      throw new ValidationError(firstError.message, compiler.errors);
    }
  }

  if (request.headers) {
    const compiler = ajv.compile(request.headers);

    compiler(req.headers);

    if (compiler.errors) {
      const [firstError] = compiler.errors;
      throw new ValidationError(firstError.message, compiler.errors);
    }
  }

  if (request.params) {
    const compiler = ajv.compile(request.params);

    compiler(req.params);

    if (compiler.errors) {
      const [firstError] = compiler.errors;
      throw new ValidationError(firstError.message, compiler.errors);
    }
  }

  if (request.querystring) {
    const compiler = ajv.compile(request.querystring);

    compiler(req.query);

    if (compiler.errors) {
      const [firstError] = compiler.errors;
      throw new ValidationError(firstError.message, compiler.errors);
    }
  }

  return;
};

const checkDiscriminatorKey = (key: string, payload: any) => {
  if (!payload[key]) {
    throw new SchemaError(`Key "${key}" doesn't exists in extends schema`);
  }
};

const getAvailableSchema = (schemas: any, key: string, payload: any, fallback?: any): any => {
  if (schemas[payload[key]]) {
    return schemas[payload[key]];
  } else if (fallback) {
    return fallback;
  } else {
    throw new SchemaError(`Schema is not available for key "${key}" and fallback didn't provided`);
  }
};

const getCompiler = (ajv: Ajv, schema: any): ValidateFunction => {
  if (schema.$ref) {
    return ajv.getSchema(schema.$ref);
  } else {
    return ajv.compile(schema);
  }
};

export const validateResponse = (ajv: Ajv, req: Request, res: Response, payload: any): any => {
  const { schemas } = res.context.config;

  if (!schemas) {
    return;
  }

  const {
    response,
  }: {
    response: IResponseSchema;
  } = schemas;

  if (response && response[res.res.statusCode]) {
    const schema = response[res.res.statusCode];

    if (schema.extends) {
      if (!schema.extends.key) {
        throw new SchemaError('Please provide key in extends schema for schema recognition');
      }

      if (!schema.extends.schemas || !isPlainObject(schema.extends.schemas)) {
        throw new SchemaError('Provide schemas based on key');
      }

      if (schema.extends.listSchema) {
        const listCompiler = ajv.compile(schema.extends.listSchema);
        listCompiler(payload);

        const listKey = schema.extends.listKey || 'data';

        if (!payload[listKey]) {
          throw new Error(`Cannot find key with list data. Please specify property "listKey" in "extends" schema`);
        }

        payload[listKey].forEach((object: any) => {
          if (schema.extends) {
            checkDiscriminatorKey(schema.extends.key, object);
            const modelSchema = getAvailableSchema(
              schema.extends.schemas,
              schema.extends.key,
              object,
              schema.extends.fallback,
            );

            const compiler = getCompiler(ajv, modelSchema);

            compiler(object);
          }
        });
      } else {
        checkDiscriminatorKey(schema.extends.key, payload);
        const modelSchema = getAvailableSchema(
          schema.extends.schemas,
          schema.extends.key,
          payload,
          schema.extends.fallback,
        );

        const compiler = getCompiler(ajv, modelSchema);

        compiler(payload);
      }
    } else {
      const compiler = ajv.compile(schema);

      compiler(payload);
    }
  }

  return payload;
};
