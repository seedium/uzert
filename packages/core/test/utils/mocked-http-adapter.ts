import { HttpAdapter } from '../../adapters';

export class MockedHttpAdapter extends HttpAdapter {
  protected _kernel;
  get app() {
    return null;
  }
  get isReady() {
    return true;
  }
  public run(): Promise<any> | any {}
  public bootKernel(): any {}
  public bootRouter(): any {}
  public listen(): any {}
  public registerRouter(...args): any {}
}
