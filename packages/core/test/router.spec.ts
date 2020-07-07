import { expect } from 'chai';
import * as sinon from 'sinon';
import { Injectable, Module, UsePipe } from '../decorators';
import { UzertFactory } from '../uzert-factory';
import { Pipe, RouteModule } from '../interfaces';
import { HttpAdapter } from '../adapters';
import { UzertApplication } from '../uzert-application';
import { UzertContainer } from '../injector';
import { PIPES_METADATA } from '../constants';

describe('Router', () => {
  const testRouterFunc = sinon.stub();
  const testOptions = {
    foo: 'bar',
  };
  @Injectable()
  class TestService2 {}
  @Injectable()
  class TestService {
    constructor(private readonly _testService2: TestService2) {}
  }
  @Injectable()
  class TestPipe2 implements Pipe {
    public use(req: any, res: any, next?: () => void): void {}
  }
  @Injectable()
  class TestPipe implements Pipe {
    static boot(options: object) {
      return {
        provide: TestPipe,
        inject: [TestService2],
        useFactory: (testService2: TestService2) => {
          return new TestPipe(testService2, options);
        },
      };
    }
    constructor(public readonly _testService2: TestService2, public options?: object) {}
    public use(req: any, res: any, next?: () => void): void {}
  }
  @Injectable()
  class TestController {
    @UsePipe(TestPipe2)
    @UsePipe(TestPipe)
    public test() {}
    @UsePipe(TestPipe.boot(testOptions))
    public testWithCustomPipe() {}
  }

  @Injectable()
  class TestRoute implements RouteModule {
    public options = testOptions;
    constructor(private readonly _testController: TestController, private readonly _testService: TestService) {}
    public register(): any {
      return testRouterFunc;
    }
  }

  @Module({
    providers: [TestService, TestService2],
    controllers: [TestController],
    routes: [TestRoute],
  })
  class AppModule {}

  afterEach(() => {
    sinon.restore();
  });
  it('should load router instance', async () => {
    const context = await UzertFactory.createApplicationContext(AppModule);
    const routeModuleInstance = await context.get(TestRoute);
    expect(routeModuleInstance).instanceOf(TestRoute);
  });
  it('should inject controllers and providers to router module', async () => {
    const context = await UzertFactory.createApplicationContext(AppModule);
    const routeModuleInstance = await context.get(TestRoute);
    expect(routeModuleInstance).property('_testService').instanceOf(TestService);
    expect(routeModuleInstance).property('_testController').instanceOf(TestController);
  });
  describe('Register routes in http adapter', () => {
    class TestHttpAdapter extends HttpAdapter {
      public routes: any[] = [];
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
      public registerRouter(container: UzertContainer, func: () => void, options): Promise<void> | void {
        this.routes.push({
          func,
          options,
        });
      }

      protected _kernel;
    }
    let app: UzertApplication<TestHttpAdapter>;
    beforeEach(async () => {
      app = await UzertFactory.create<TestHttpAdapter>(AppModule, new TestHttpAdapter());
      sinon.stub(app.httpAdapter, 'listen');
    });
    it('uzert application should register router module in adapter', async () => {
      await app.listen();
      expect(app.httpAdapter).property('routes').an('array').length(1);
      const [router] = app.httpAdapter.routes;
      expect(router.func).eq(testRouterFunc);
      expect(router.options).eq(testOptions);
    });
    it('should load pipes for controller method', async () => {
      await app.listen();
      const module = app.container.getModules().values().next().value;
      expect(module.injectables.size).eq(3);
      expect(module.injectables.has(TestPipe.name)).to.be.true;
      expect(module.injectables.get(TestPipe.name).instance).instanceOf(TestPipe);
      expect(module.injectables.get(TestPipe2.name).instance).instanceOf(TestPipe2);
    });
    it('should load custom pipe with options only for controller method', async () => {
      await app.listen();
      const testCustomPipe = app.get(`TestPipeTestWithCustomPipe`);
      expect(testCustomPipe).instanceOf(TestPipe);
      expect(testCustomPipe).property('options').deep.eq(testOptions);
    });
    it('injection should work in pipes', async () => {
      await app.listen();
      const testPipe = app.get(TestPipe);
      expect(testPipe).property('_testService2').instanceOf(TestService2);
    });
    it('should compose pipes from the top to bottom', () => {
      class TestComposeController {
        @UsePipe(TestPipe)
        @UsePipe(TestPipe2)
        public test() {}
      }
      const testController = new TestComposeController();
      const pipes = Reflect.getMetadata(PIPES_METADATA, testController.test);
      expect(pipes).length(2);
      const [firstPipe, secondPipe] = pipes;
      expect(firstPipe).eq(TestPipe);
      expect(secondPipe).eq(TestPipe2);
    });
  });
});
