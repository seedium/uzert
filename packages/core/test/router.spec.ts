import { expect } from 'chai';
import * as sinon from 'sinon';
import { Injectable, Module, UsePipe } from '../decorators';
import { UzertFactory } from '../uzert-factory';
import { Pipe, RouteModule } from '../interfaces';
import { UzertApplication } from '../uzert-application';
import { UzertContainer } from '../injector';
import { PIPES_METADATA } from '../constants';
import { MockedHttpAdapter } from './utils';

describe('Router', () => {
  const testRouterFunc = sinon.stub();
  const testOptions = {
    foo: 'bar',
  };
  @Injectable()
  class TestService {}
  @Injectable()
  class TestPipe implements Pipe {
    static boot(options: object) {
      return {
        provide: TestPipe,
        useFactory: (testService: TestService) => {
          return new TestPipe(testService, options);
        },
      };
    }
    constructor(public readonly _testService: TestService, public options?: object) {}
    public use(req: any, res: any, next?: () => void): void {}
  }
  @Injectable()
  class TestController {
    @UsePipe(TestPipe)
    public test() {}
    @UsePipe(TestPipe.boot(testOptions))
    public testWithCustomPipe() {}
  }

  @Injectable()
  class TestRoute implements RouteModule {
    public options = testOptions;
    constructor() {}
    public register(): any {
      return testRouterFunc;
    }
  }

  afterEach(() => {
    sinon.restore();
  });
  it('should load router instance', async () => {
    @Module({
      routes: [TestRoute],
    })
    class AppModule {}
    const context = await UzertFactory.createApplicationContext(AppModule);
    const routeModuleInstance = await context.get(TestRoute);
    expect(routeModuleInstance).instanceOf(TestRoute);
  });
  describe('Register routes in http adapter', () => {
    @Module({
      providers: [TestService],
      controllers: [TestController],
      routes: [TestRoute],
    })
    class AppModule {}
    class TestHttpAdapter extends MockedHttpAdapter {
      public routes: any[] = [];
      public registerRouter(container: UzertContainer, func: () => void, options): Promise<void> | void {
        this.routes.push({
          func,
          options,
        });
      }
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
      expect(module.injectables.size).eq(2);
      expect(module.injectables.has(TestPipe.name)).to.be.true;
      expect(module.injectables.get(TestPipe.name).instance).instanceOf(TestPipe);
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
      expect(testPipe).property('_testService').instanceOf(TestService);
    });
    it('should compose pipes from the top to bottom', () => {
      class TestPipe2 implements Pipe {
        use(req: any, res: any, next?: () => void): void {}
      }
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
