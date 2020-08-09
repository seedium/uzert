export interface RouteModule {
  options?: Record<string, unknown>;
  register(): void;
}

export interface Pipe {
  use(req: unknown, res: unknown, next?: () => void): void;
}
