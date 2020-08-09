import { HttpKernelAdapter } from './http-kernel.adapter';
import { OnDispose } from '../interfaces';
import { UzertContainer } from '../injector';

export abstract class HttpAdapter<
  AppInstance = unknown,
  Request = unknown,
  Response = unknown
> implements OnDispose {
  protected abstract _kernel: HttpKernelAdapter<Request, Response>;
  abstract get app(): AppInstance;
  abstract get isReady(): boolean;
  public abstract run(): Promise<AppInstance> | AppInstance;
  public abstract listen(...args: unknown[]): Promise<void> | unknown;
  public abstract registerRouter(
    container: UzertContainer,
    ...args: unknown[]
  ): Promise<unknown> | unknown;
  public abstract onDispose(): unknown;
  protected abstract bootKernel(): Promise<unknown> | unknown;
}
