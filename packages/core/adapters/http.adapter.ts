import { HttpKernelAdapter } from './http-kernel.adapter';
import { HttpRouterAdapter } from './http-router.adapter';
import { ProviderInstance } from '../interfaces';

export abstract class HttpAdapter<AppInstance = any, Request = any, Response = any> extends ProviderInstance {
  protected abstract _router: HttpRouterAdapter;
  protected abstract _kernel: HttpKernelAdapter<Request, Response>;
  abstract get app(): AppInstance;
  abstract get isReady(): boolean;
  public abstract run(): Promise<AppInstance> | AppInstance;
  public abstract listen(...args: any[]): Promise<void> | any;
  protected abstract bootKernel(): Promise<any> | any;
  protected abstract bootRouter(): Promise<any> | any;
}
