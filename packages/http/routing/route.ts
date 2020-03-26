import * as fs from 'fs';
import * as path from 'path';
import { Handler, HighLevelHandler } from '../interfaces';
import { ControllerRouter } from './controller-router';
import { Middleware } from '../services';
// errors
import { RoutesNotFoundError } from '../errors';

export class Route {
  public static routes: Route[] = [];

  public static namespace(namespace: string) {
    const route = Route.routes.find((routeInstance) => {
      return routeInstance.namespace === namespace;
    });

    if (route) {
      route.isInherit = true;

      return route;
    } else {
      const newRoute = new Route(namespace);
      newRoute.isInherit = false;

      Route.routes.push(newRoute);

      return newRoute;
    }
  }

  public static async initRoutes(app: any): Promise<any> {
    this.checkRoutes();
    // @ts-ignore
    await import('routes/web');

    Route.routes.forEach((plugin: Route) => {
      plugin.getRegisteredRouters().forEach((router) => {
        app.register(router, {
          prefix: plugin.pref,
        });
      });
    });

    return app;
  }

  public static checkRoutes() {
    const pathToRoutes = path.resolve(process.cwd(), 'src', 'routes', 'web.ts');

    if (!fs.existsSync(pathToRoutes)) {
      throw new RoutesNotFoundError();
    }
  }

  public namespace: string;
  public isInherit: boolean = false;

  private handlers: any[] = [];
  private middlewares: any[] = [];
  private pref: string = '';
  private router: ControllerRouter | null = null;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  public group(cb: Handler | HighLevelHandler) {
    if (this.isInherit && this.router) {
      cb = cb as HighLevelHandler;
      this.router.setPrefix(this.pref);

      cb();
    } else {
      this.handlers.push(async (router: any) => {
        const controllerRouter = new ControllerRouter(router, this.middlewares);
        this.router = controllerRouter;

        return await cb(controllerRouter);
      });
    }
  }

  public middleware(middlewares: any[]) {
    if (middlewares.length) {
      middlewares.forEach(async (middleware) => {
        if (typeof middleware === 'string') {
          this.middlewares.push(await Middleware.loadMiddleware(middleware));
        } else {
          this.middlewares.push(middleware);
        }
      });
    }

    return this;
  }

  public prefix(prefix: string) {
    this.pref = prefix;

    return this;
  }

  public getRegisteredRouters() {
    return this.handlers;
  }
}
