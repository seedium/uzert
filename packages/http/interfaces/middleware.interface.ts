export interface IMiddleware {
  handle(req: any, res: any): void;
}
