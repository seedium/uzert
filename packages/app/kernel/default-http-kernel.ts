import { HttpKernelAdapter } from '@uzert/core';

export class DefaultHttpKernel extends HttpKernelAdapter {
  public plugins = [];
  public middlewares = [];
}
