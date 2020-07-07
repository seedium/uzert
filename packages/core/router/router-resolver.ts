import { UzertContainer } from '../injector';
import { HttpAdapter } from '../adapters';
import { Module } from '../injector/module';
import { InstanceWrapper } from '../injector/instance-wrapper';
import { RouteModule } from '../interfaces';
import { ModulesContainer } from '../injector/modules-container';

export class RouterResolver {
  constructor(private readonly _container: UzertContainer, private readonly _httpAdapter: HttpAdapter) {}
  public async registerRoutes(): Promise<void> {
    const modules = this._container.getModules();
    const routers = this.getRoutersFromModules(modules);
    await Promise.all(routers.map(this.callRouterRegister.bind(this)));
  }
  protected async registerControllersEnhancers() {}
  protected getRoutersFromModules(modules: ModulesContainer): InstanceWrapper<RouteModule>[] {
    return [...modules.values()].reduce<InstanceWrapper<RouteModule>[]>((acc, module) => {
      acc.push(...this.getRoutersInModule(module));
      return acc;
    }, []);
  }
  protected getRoutersInModule(module: Module): InstanceWrapper<RouteModule>[] {
    const { routes } = module;
    return [...routes.values()];
  }
  protected async callRouterRegister(router: InstanceWrapper<RouteModule>) {
    const { instance } = router;
    const registerRequest = await instance.register();
    await this._httpAdapter.registerRouter(this._container, registerRequest, instance.options);
  }
}
