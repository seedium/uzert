import { HTTPMethod, ControllerDefinitionOrHandler, IControllerRouter, IControllerDefinition } from '../index';
import Controller from '../Controller';
import Middleware from '../Middleware';
// services
import Validation, { IRequestSchema, IResponseSchema, RouteSchema } from '@uzert/validation';

export default class ControllerRouter implements IControllerRouter {
  protected router: any;
  protected middlewares: any[];
  protected prefix: string = '';

  constructor(router: any, middlewares: any[] = []) {
    this.router = router;
    this.middlewares = middlewares;
  }

  public setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  public async head(
    path: string,
    controllerDefinitionOrHandler: ControllerDefinitionOrHandler,
    controllerDefinition?: string,
  ) {
    return await this.call('HEAD', path, controllerDefinitionOrHandler, controllerDefinition);
  }

  public async get(
    path: string,
    controllerDefinitionOrHandler: ControllerDefinitionOrHandler,
    controllerDefinition?: string,
  ) {
    return await this.call('GET', path, controllerDefinitionOrHandler, controllerDefinition);
  }

  public async post(
    path: string,
    controllerDefinitionOrHandler: ControllerDefinitionOrHandler,
    controllerDefinition?: string,
  ) {
    return await this.call('POST', path, controllerDefinitionOrHandler, controllerDefinition);
  }

  public async put(
    path: string,
    controllerDefinitionOrHandler: ControllerDefinitionOrHandler,
    controllerDefinition?: string,
  ) {
    return await this.call('PUT', path, controllerDefinitionOrHandler, controllerDefinition);
  }

  public async delete(
    path: string,
    controllerDefinitionOrHandler: ControllerDefinitionOrHandler,
    controllerDefinition?: string,
  ) {
    return await this.call('DELETE', path, controllerDefinitionOrHandler, controllerDefinition);
  }

  public async call(
    method: HTTPMethod,
    path: string,
    controllerDefinitionOrHandler: ControllerDefinitionOrHandler,
    controllerDefinition?: string,
  ) {
    let controller: IControllerDefinition;
    // TODO fix preHandlers array. Seems some middlewares calls multiple times
    const withHandler: any = {
      preHandler: this.middlewares,
      preSerialization: [],
    };

    if (typeof controllerDefinitionOrHandler === 'string' && controllerDefinition) {
      const middleware = await Middleware.loadMiddleware(controllerDefinitionOrHandler);
      withHandler.preHandler = [...this.middlewares, middleware];
      controller = await Controller.loadController(controllerDefinition);
    } else if (typeof controllerDefinitionOrHandler === 'object' && controllerDefinition) {
      // TODO add type for middleware definition
      const promises = controllerDefinitionOrHandler.map((middlewareDefinition: any) => {
        return new Promise(resolve => {
          if (typeof middlewareDefinition === 'function') {
            return resolve(middlewareDefinition);
          } else if (Array.isArray(middlewareDefinition)) {
            const [middleware, params] = middlewareDefinition;
            return resolve(Middleware.loadMiddleware(middleware, params));
          } else {
            return resolve(Middleware.loadMiddleware(middlewareDefinition));
          }
        });
      });

      const middlewares = await Promise.all(promises);
      withHandler.preHandler = [...this.middlewares, ...middlewares];

      controller = await Controller.loadController(controllerDefinition);
    } else if (typeof controllerDefinitionOrHandler === 'function' && controllerDefinition) {
      withHandler.preHandler.push(controllerDefinitionOrHandler);

      controller = await Controller.loadController(controllerDefinition);
    } else if (typeof controllerDefinitionOrHandler === 'string' && !controllerDefinition) {
      controller = await Controller.loadController(controllerDefinitionOrHandler as string);
    } else {
      throw new Error('Some unhandled error in routing. Please consider this case');
    }

    const schemaCompiler = Validation.getSchemaCompiler(
      'controllers',
      `${controller.instance.name}${controller.method}`,
    );
    const schemaRef = Validation.getSchemaRef('controllers', `${controller.instance.name}${controller.method}`);

    let request: IRequestSchema = {
      summary: 'Unknown',
      tags: ['default'],
    };
    let response: IResponseSchema = {};

    if (schemaCompiler && schemaCompiler.schema) {
      const { response: responseSchema, ...requestSchema }: RouteSchema = schemaCompiler.schema as RouteSchema;

      if (responseSchema) {
        response = responseSchema;
      }

      if (requestSchema) {
        request = requestSchema;
      }

      withHandler.preHandler.unshift(Validation.validateRequest);
      withHandler.preSerialization.unshift(Validation.validateResponse);
    }

    return this.router.route({
      method,
      url: this.prefix + path,
      handler: controller.instance[controller.method],
      config: {
        schemas: {
          request,
          response,
        },
        schemaRef,
      },
      ...withHandler,
    });
  }
}
