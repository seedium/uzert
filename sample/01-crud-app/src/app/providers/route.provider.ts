import { Route } from '@uzert/http';
import { IProvider } from '@uzert/core';

export class RouteProvider implements IProvider {
  public async for() {
    await this.mapApiRoutes();
  }

  protected async mapApiRoutes() {
    await Route.importFrom('routes/web');
  }
}
