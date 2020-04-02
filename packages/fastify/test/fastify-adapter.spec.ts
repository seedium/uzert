import { expect } from 'chai';
import { FastifyAdapter, FastifyHttpKernelAdapter } from '../adapters';

describe('App', () => {
  it('app should be booted', async () => {});

  it('should boot kernel', () => {
    const fastifyAdapter = new FastifyAdapter();
    fastifyAdapter.bootKernel();
  });

  it('should boot external kernel', () => {
    class Kernel extends FastifyHttpKernelAdapter {
      public async notFoundHandler() {
        return {
          message: 'external test',
        };
      }
    }

    const fastifyAdapter = new FastifyAdapter();
    fastifyAdapter.bootKernel(new Kernel());
  });

  it('should boot router');
});
