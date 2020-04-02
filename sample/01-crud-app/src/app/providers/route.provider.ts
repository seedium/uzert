import { Route } from '@uzert/http';
import { IProvider } from '@uzert/core';

export class RouteProvider implements IProvider {
  public async boot() {
    await this.mapApiRoutes();
  }

  protected async mapApiRoutes() {
    await Route.importFrom('routes/web');
  }
}
