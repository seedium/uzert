import HttpKernel from './HttpKernel';

export default class DefaultHttpKernel extends HttpKernel {
  public plugins = [];
  public middlewares = [];
}
