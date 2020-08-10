import { expect } from 'chai';
import * as sinon from 'sinon';
import { AbstractLogger, DefaultLogger } from '@uzert/logger';
import { FastifyAdapter, FastifyHttpKernelAdapter } from '../adapters';
import { IPluginKernel } from '../interfaces';

describe('Fastify', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should create fastify instance', async () => {
    const fastifyAdapter = new FastifyAdapter();
    expect(fastifyAdapter.app).not.undefined;
    expect(fastifyAdapter.app).haveOwnProperty('server');
  });
  it('should use default logger', () => {
    const adapter = new FastifyAdapter();
    expect(adapter).property('_logger').instanceOf(DefaultLogger);
  });
  it('should use custom logger', () => {
    class CustomLogger implements AbstractLogger {
      fatal(...args): void {}
      error(...args): void {}
      warn(...args): void {}
      info(...args): void {}
      debug(...args): void {}
      trace(...args): void {}
      child(...args): AbstractLogger {
        return this;
      }
    }
    const adapter = new FastifyAdapter({ http2: true }, new CustomLogger());
    expect(adapter).property('_logger').instanceOf(CustomLogger);
  });
  it('should use generate request id', async () => {
    const spyGenerateRequestId = sinon.spy(
      FastifyAdapter.prototype,
      <any>'generateRequestId',
    );
    const adapter = new FastifyAdapter({
      logger: false,
      http2: true,
    });
    await adapter.app.inject({
      url: '/test',
    });
    expect(spyGenerateRequestId.calledOnce).to.be.true;
  });
  it('should use parse query string', async () => {
    const spyParseQueryString = sinon.spy(
      FastifyAdapter.prototype,
      <any>'parseQueryString',
    );
    const adapter = new FastifyAdapter({
      logger: false,
      http2: true,
    });
    await adapter.app.inject({
      url: '/test?foo=bar',
    });
    expect(spyParseQueryString.calledOnce).to.be.true;
  });
  it('should call fastify listen method', async () => {
    const adapter = new FastifyAdapter();
    const stubFastifyListen = sinon.stub(adapter.app, 'listen');
    await adapter.listen(3000, '0.0.0.0');
    expect(stubFastifyListen.calledOnce).to.be.true;
  });
  it('when service instance is disposed should call fastify close method', async () => {
    const adapter = new FastifyAdapter();
    const stubFastifyClose = sinon.stub(adapter.app, 'close');
    await adapter.onDispose();
    expect(stubFastifyClose.calledOnce).to.be.true;
  });
  describe('when call `run` method', () => {
    let adapter: FastifyAdapter;
    let stubBootKernel: sinon.SinonStub;
    let spyFastifyReady: sinon.SinonSpy;
    beforeEach(() => {
      adapter = new FastifyAdapter();
      stubBootKernel = sinon.stub(adapter, <any>'bootKernel');
      spyFastifyReady = sinon.stub(adapter.app, 'ready').resolves(true);
    });
    it('should boot kernel, boot router and wait when instance will be ready', async () => {
      await adapter.run();
      expect(stubBootKernel.calledOnce).to.be.true;
      expect(spyFastifyReady.calledOnce).to.be.true;
      expect(spyFastifyReady.calledAfter(stubBootKernel)).to.be.true;
    });
    it('when app is already run, should not boot kernel,router and return fastify instance', async () => {
      await adapter.run();
      await adapter.run();
      expect(stubBootKernel.calledOnce).to.be.true;
      expect(spyFastifyReady.calledOnce).to.be.true;
    });
  });
  describe('when call `bootKernel` method', () => {
    describe('with custom kernel', () => {
      const testPluginOptions = {
        foo: 'bar',
      };
      let stubPlugin: sinon.SinonStub;
      let stubNotFoundHandler: sinon.SinonStub;
      let stubErrorHandler: sinon.SinonStub;
      let adapter: FastifyAdapter;
      beforeEach(() => {
        stubPlugin = sinon.stub().callsFake((app, options, done) => done());
        class CustomKernel extends FastifyHttpKernelAdapter {
          public plugins: IPluginKernel[] = [
            {
              plugin: stubPlugin,
              options: testPluginOptions,
            },
          ];
        }
        const customKernel = new CustomKernel();
        customKernel.notFoundHandler = stubNotFoundHandler;
        customKernel.errorHandler = stubErrorHandler;
        class Test extends FastifyAdapter {
          protected _kernel = customKernel;
        }
        adapter = new Test();
      });
      it('should register kernel plugins', async () => {
        const spyFastifyRegister = sinon.spy(adapter.app, 'register');
        await adapter.run();
        expect(spyFastifyRegister.calledOnce).to.be.true;
        expect(
          spyFastifyRegister.calledWithExactly(stubPlugin, testPluginOptions),
        ).to.be.true;
        const secondArg = stubPlugin.firstCall.args[1];
        expect(secondArg).deep.eq(testPluginOptions);
      });
      it('should set not found handler', async () => {
        const stubFastifySetNotFoundHandler = sinon.stub(
          adapter.app,
          'setNotFoundHandler',
        );
        await adapter.run();
        expect(
          stubFastifySetNotFoundHandler.calledOnceWithExactly(
            stubNotFoundHandler,
          ),
        ).to.be.true;
      });
      it('should set error handler', async () => {
        const stubFastifySetErrorHandler = sinon.stub(
          adapter.app,
          'setErrorHandler',
        );
        await adapter.run();
        expect(
          stubFastifySetErrorHandler.calledOnceWithExactly(stubErrorHandler),
        ).to.be.true;
      });
    });
    describe('with default kernel', () => {
      let adapter: FastifyAdapter;
      let spyNotFoundHandler: sinon.SinonSpy;
      let spyErrorHandler: sinon.SinonSpy;
      beforeEach(async () => {
        spyNotFoundHandler = sinon.spy(
          FastifyHttpKernelAdapter.prototype,
          'notFoundHandler',
        );
        spyErrorHandler = sinon.spy(
          FastifyHttpKernelAdapter.prototype,
          'errorHandler',
        );
        adapter = new FastifyAdapter({
          logger: false,
          http2: true,
        });
      });
      it('should use default not found handler', async () => {
        await adapter.run();
        await adapter.app.inject({
          url: '/not-found',
        });
        expect(spyNotFoundHandler.calledOnce).to.be.true;
      });
      it('should use default error handler', async () => {
        const testError = new Error('test');
        adapter.app.get('/test-error', async () => {
          throw testError;
        });
        await adapter.run();
        await adapter.app.inject({
          url: '/test-error',
        });
        expect(spyErrorHandler.calledOnceWith(testError)).to.be.true;
      });
    });
  });
});
