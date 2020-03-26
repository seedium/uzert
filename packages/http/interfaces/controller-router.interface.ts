export type HTTPMethod = 'DELETE' | 'GET' | 'HEAD' | 'PATCH' | 'POST' | 'PUT' | 'OPTIONS';
export type RouteHandler = (req: Request, res: Response) => void | Promise<void>;
export type MiddlewarePayload = [string, any];
export type ControllerDefinitionOrHandler = string | string[] | MiddlewarePayload[] | RouteHandler | any;

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
