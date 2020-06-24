import { ProviderInstance } from '../interfaces';

export abstract class HttpAdapter<AppInstance = any> extends ProviderInstance {
  abstract get app(): AppInstance;
  abstract get isReady(): boolean;
  public abstract run(): Promise<AppInstance> | AppInstance;
  public abstract bootKernel(): Promise<any> | any;
  public abstract bootRouter(): Promise<any> | any;
  public abstract listen(...args: any[]): Promise<void> | any;
}
