import { expect } from 'chai';
import * as sinon from 'sinon';
import fastify from 'fastify';
import {
  UzertFactory,
  UzertContainer,
  Module,
  Injectable,
  Pipe,
  UsePipe,
  RouteModule,
  InstanceLoader,
  ContainerScanner,
} from '@uzert/core';
import { FastifyAdapter } from '../adapters';
import { Router } from '../router';
import { Controller } from '../decorators';
import { ROUTER_INSTANCE } from '@uzert/core/constants';

describe('Fastify Router', () => {
  @Injectable()
  class TestPipe implements Pipe {
    public use(req: any, res: any, next?: () => void): void {}
  }
  beforeEach(() => {
    // Do not modify handler for properly test cases
    sinon.stub(Router.prototype, <any>'bindMethod').callsFake((handler) => handler);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('Register', () => {
    it('should pass router with uzert container to register', async () => {
      const stubRouterRegisterCallback: sinon.SinonStub = sinon.stub();
      @Injectable()
      class TestRouter implements RouteModule {
        public register(): any {
          return stubRouterRegisterCallback;
        }
      }
      @Module({
        routes: [TestRouter],
      })
      class AppModule {}
      const app = await UzertFactory.create(AppModule, new FastifyAdapter());
      sinon.stub(app.httpAdapter.app, 'listen');
      await app.listen();
      expect(stubRouterRegisterCallback.calledOnce).to.be.true;
      const [[router]] = stubRouterRegisterCallback.args;
      expect(router).instanceOf(Router);
      expect(router).property('_container').instanceOf(UzertContainer);
      expect(router).property('_app');
    });
  });
  describe('Router', () => {
    it('should register all methods', async () => {
      const methods = ['post', 'get', 'put', 'delete', 'patch', 'head'];
      const router = new Router(new UzertContainer(), fastify());
      const stubFastifyRoute = sinon.stub((router as any)._app, 'route');
      methods.forEach((method) => {
        const stubMethodHandler = sinon.stub();
        Reflect.defineMetadata(ROUTER_INSTANCE, {}, stubMethodHandler);
        router[method]('/', stubMethodHandler);
        expect(
          stubFastifyRoute.calledWithExactly({
            method: method.toUpperCase(),
            url: '/',
            handler: stubMethodHandler,
            preHandler: [],
          }),
        ).to.be.true;
      });
      expect(stubFastifyRoute.callCount).eq(methods.length);
    });
    describe('metadata injection', () => {
      let container: UzertContainer;
      let moduleToken: string;
      let instanceLoader: InstanceLoader;
      let containerScanner: ContainerScanner;
      @Module({})
      class AppModule {}
      beforeEach(async () => {
        container = new UzertContainer();
        instanceLoader = new InstanceLoader(container);
        containerScanner = new ContainerScanner(container);
        await container.addModule(AppModule, []);
        moduleToken = await container.getModuleToken(AppModule);
      });
      it('should set pipes as route pre handler', async () => {
        @Injectable()
        class TestController {
          @UsePipe(TestPipe)
          @Controller()
          public test() {}
        }
        container.addController(TestController, moduleToken);
        container.addInjectable(TestPipe, moduleToken);
        await instanceLoader.createInstancesOfDependencies();
        const router = new Router(container, fastify());
        const stubFastifyRoute = sinon.stub((router as any)._app, 'route');
        const testController = containerScanner.find(TestController);
        router.get('/', testController.test);
        const [[routeArgs]] = stubFastifyRoute.args;
        expect(routeArgs).property('preHandler').an('array').length(1);
        const testPipe = containerScanner.find(TestPipe);
        expect(routeArgs.preHandler[0]).eq(testPipe.use);
      });
      it('should throw an error if "@Controller" decorator was not specified', async () => {
        @Injectable()
        class TestController {
          public test() {}
        }
        container.addController(TestController, moduleToken);
        await instanceLoader.createInstancesOfDependencies();
        const router = new Router(container, fastify());
        const testController = containerScanner.find(TestController);
        try {
          router.get('/', testController.test);
        } catch (e) {
          return;
        }
        throw new Error('Should throw an error if decorator was not specified');
      });
      it('should load pipes with custom options for each method', async () => {
        sinon.restore();
        const options1 = { foo: 'bar' };
        const options2 = { hello: 'world' };
        class TestCustomPipe implements Pipe {
          static use(options: any) {
            return {
              provide: TestCustomPipe,
              useFactory: () => {
                return new TestCustomPipe(options);
              },
            };
          }
          constructor(public readonly options) {}
          public use(req: any, res: any, next?: () => void): void {
            return this.options;
          }
        }
        @Injectable()
        class TestController {
          @UsePipe(TestCustomPipe.use(options1))
          @Controller()
          public test() {}
          @UsePipe(TestCustomPipe.use(options2))
          @Controller()
          public test2() {}
        }
        container.addController(TestController, moduleToken);
        container.addInjectable(TestCustomPipe.use(options1), moduleToken, TestController, 'test');
        container.addInjectable(TestCustomPipe.use(options2), moduleToken, TestController, 'test2');
        await instanceLoader.createInstancesOfDependencies();
        const router = new Router(container, fastify());
        const testController = containerScanner.find(TestController);
        const stubFastifyRoute = sinon.stub((router as any)._app, 'route');
        router.get('/test', testController.test);
        router.get('/test2', testController.test2);
        const [[firstCall], [secondCall]] = stubFastifyRoute.args;
        const [pipe1] = firstCall.preHandler;
        const [pipe2] = secondCall.preHandler;
        expect(pipe1()).deep.eq(options1);
        expect(pipe2()).deep.eq(options2);
      });
    });
  });
});
