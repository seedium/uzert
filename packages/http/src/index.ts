export type HTTPMethod = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS';
export type RouteHandler = (req: Request, res: Response) => void | Promise<void>;
export type MiddlewarePayload = [string, any];
export type ControllerDefinitionOrHandler = string | string[] | MiddlewarePayload[] | RouteHandler | any;
export type HighLevelHandler = () => void;
export type Handler = (router: IControllerRouter) => Promise<void>;

export interface IControllerRouter {
  setPrefix(prefix: string): void;
  head(path: string, controllerDefinitionOrHandler: ControllerDefinitionOrHandler, controllerDefinition?: string): any;
  get(path: string, controllerDefinitionOrHandler: ControllerDefinitionOrHandler, controllerDefinition?: string): any;
  post(path: string, controllerDefinitionOrHandler: ControllerDefinitionOrHandler, controllerDefinition?: string): any;
  put(path: string, controllerDefinitionOrHandler: ControllerDefinitionOrHandler, controllerDefinition?: string): any;
  delete(
    path: string,
    controllerDefinitionOrHandler: ControllerDefinitionOrHandler,
    controllerDefinition?: string,
  ): any;
  call(
    method: HTTPMethod,
    path: string,
    controllerDefinitionOrHandler: ControllerDefinitionOrHandler,
    controllerDefinition?: string,
  ): any;
}

export interface IControllerDefinition {
  path: string;
  method: string;
  instance: any;
}

export interface IMiddleware {
  handle(req: any, res: any): void;
}

export { default as Controller } from './Controller';
export { default as Middleware } from './Middleware';
export { default as ControllerRouter } from './Routing/ControllerRouter';
export { default as Route } from './Routing/Route';
