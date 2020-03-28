import { HttpKernelAdapter } from './http-kernel.adapter';

export abstract class HttpAdapter<AppInstance = any> {
  public abstract async run(): Promise<AppInstance>;
  protected abstract async bootKernel(kernel: HttpKernelAdapter);
  protected abstract async bootRouter();
  protected abstract async applyMiddleware(middleware: string);
}
