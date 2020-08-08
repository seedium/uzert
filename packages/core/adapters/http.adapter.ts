import { HttpKernelAdapter } from './http-kernel.adapter';
import { OnDispose } from '../interfaces';
import { UzertContainer } from '../injector';

export abstract class HttpAdapter<
  AppInstance = any,
  Request = any,
  Response = any
> implements OnDispose {
  protected abstract _kernel: HttpKernelAdapter<Request, Response>;
  abstract get app(): AppInstance;
  abstract get isReady(): boolean;
  public abstract run(): Promise<AppInstance> | AppInstance;
  public abstract listen(...args: any[]): Promise<void> | any;
  public abstract registerRouter(
    container: UzertContainer,
    ...args: any[]
  ): Promise<any> | any;
  public abstract onDispose(): any;
  protected abstract bootKernel(): Promise<any> | any;
}
