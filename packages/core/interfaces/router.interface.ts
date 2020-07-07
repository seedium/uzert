export interface RouteModule {
  options?: any;
  register(): any;
}

export interface Pipe {
  use(req: any, res: any, next?: () => void): void;
}
