export interface AbstractRouter {
  post(path: string, handler: unknown): void;
  get(path: string, handler: unknown): void;
  put(path: string, handler: unknown): void;
  delete(path: string, handler: unknown): void;
  patch(path: string, handler: unknown): void;
  head(path: string, handler: unknown): void;
}

export interface RouteModule {
  options?: Record<string, unknown>;
  register(router: AbstractRouter, app: unknown): void | Promise<void>;
}

export interface Pipe {
  use(req: unknown, res: unknown, next?: () => void): void;
}
