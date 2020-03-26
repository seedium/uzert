import { HttpKernel } from './http-kernel';

export class DefaultHttpKernel extends HttpKernel {
  public plugins = [];
  public middlewares = [];
}
