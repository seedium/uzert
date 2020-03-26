import { IMiddleware } from '../index';

export default abstract class Middleware implements IMiddleware {
  public static async loadMiddleware(middlewarePath: string, params?: any) {
    if (!middlewarePath) {
      throw new Error('Path to middlewarePath are empty');
    }

    // dynamic require middleware
    const middleware = new (await import('app/Middlewares/' + middlewarePath)).default();

    if (!middleware) {
      throw new Error('Bad middleware + ' + middlewarePath);
    }

    return middleware.boot(params);
  }

  public abstract handle(req: any, res: any): any;

  public boot() {
    return this.handle;
  }
}
