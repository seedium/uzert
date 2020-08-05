import { expect } from 'chai';
import { UzertFactory } from '../uzert-factory';
import { Inject, Injectable, Module, Optional } from '../decorators';
import { UzertApplicationContext } from '../uzert-application-context';
import { UnknownElementError } from '../errors';
import { InstanceLoader, UzertContainer, ContainerScanner } from '../injector';
import { PROPERTY_DEPS_METADATA, SELF_DECLARED_DEPS_METADATA } from '../constants';
import * as sinon from 'sinon';
import { ErrorsZone } from '../errors/handlers/errors-zone';
import { RouteModule } from '../interfaces';

describe('Injection', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('Injectable', () => {
    @Injectable()
    class TestProvider2 {}

    @Injectable()
    class TestProvider {
      constructor(private readonly _testProvider2: TestProvider2) {}
    }

    @Module({
      controllers: [],
      providers: [TestProvider, TestProvider2],
    })
    class AppModule {}

    let ctx: UzertApplicationContext;
    beforeEach(async () => {
      ctx = await UzertFactory.createApplicationContext(AppModule);
    });
    it('providers should be singleton', async () => {
      const testProvider = ctx.get<TestProvider>(TestProvider);
      const testProvider2 = ctx.get<TestProvider>(TestProvider);
      expect(testProvider).eq(testProvider2);
    });
    it('should resolve TestProvider on first level dependencies by token', async () => {
      const testProvider = ctx.get<TestProvider>('TestProvider');
      expect(testProvider).not.undefined;
      expect(testProvider).instanceOf(TestProvider);
    });
    it('should resolve TestProvider on first level dependencies by type', async () => {
      const testProvider = ctx.get<TestProvider>(TestProvider);
      expect(testProvider).not.undefined;
      expect(testProvider).instanceOf(TestProvider);
    });
    it('should resolve TestProvider2 on second level dependencies by token', async () => {
      const testProvider2 = ctx.get<TestProvider2>('TestProvider2');
      expect(testProvider2).not.undefined;
      expect(testProvider2).instanceOf(TestProvider2);
    });
    it('should resolve TestProvider2 on second level dependencies by type', async () => {
      const testProvider2 = ctx.get<TestProvider2>(TestProvider2);
      expect(testProvider2).not.undefined;
      expect(testProvider2).instanceOf(TestProvider2);
    });
    it('should use factory for creating providers', async () => {
      const testOptions = {
        foo: 'bar',
      };
      @Injectable()
      class AsyncTestProvider {
        static boot(options: Record<string, any>) {
          return {
            provide: AsyncTestProvider,
            inject: [TestProvider],
            useFactory: async (testProvider: TestProvider) => {
              return new AsyncTestProvider(options, testProvider);
            },
          };
        }
        constructor(public readonly _options: Record<string, any>, public readonly _testProvider: TestProvider) {}
      }
      @Module({
        providers: [AsyncTestProvider.boot(testOptions), TestProvider, TestProvider2],
      })
      class AsyncAppModule {}
      const asyncContext = await UzertFactory.createApplicationContext(AsyncAppModule);
      const asyncTestProvider = asyncContext.get<AsyncTestProvider>(AsyncTestProvider);
      expect(asyncTestProvider).instanceOf(AsyncTestProvider);
      expect(asyncTestProvider).haveOwnProperty('_testProvider').instanceOf(TestProvider);
      expect(asyncTestProvider).haveOwnProperty('_options').deep.eq(testOptions);
    });
    it('should not resolve if @Injectable decorator was specified but not added to module providers', async () => {
      @Injectable()
      class BrokenTestProvider {}

      @Module({
        providers: [],
      })
      class BrokenAppModule {}

      const brokenContext = await UzertFactory.createApplicationContext(BrokenAppModule);
      try {
        brokenContext.get(BrokenTestProvider);
      } catch (e) {
        expect(e).instanceOf(UnknownElementError);
        return;
      }
      throw new Error('Should not resolve provider');
    });
    it('should return instance from injectables', async () => {
      @Injectable()
      class InjectableTest {}
      @Module({})
      class AppModule {}
      const container = new UzertContainer();
      await container.addModule(AppModule, []);
      const instanceLoader = new InstanceLoader(container);
      const containerScanner = new ContainerScanner(container);
      const moduleToken = await container.getModuleToken(AppModule);
      container.addInjectable(InjectableTest, moduleToken);
      await instanceLoader.createInstancesOfDependencies();
      const resolvedInjectable = containerScanner.find(InjectableTest);
      expect(resolvedInjectable).instanceOf(InjectableTest);
    });
    it('should inject controllers and providers to router module', async () => {
      @Injectable()
      class TestController {}
      @Injectable()
      class TestRoute implements RouteModule {
        constructor(private readonly _testProvider: TestProvider, private readonly _testController: TestController) {}
        public register(): any {}
      }
      @Module({
        providers: [TestProvider, TestProvider2],
        controllers: [TestController],
        routes: [TestRoute],
      })
      class RouterAppModule {}
      const context = await UzertFactory.createApplicationContext(RouterAppModule);
      const routeModuleInstance = await context.get(TestRoute);
      expect(routeModuleInstance).property('_testProvider').instanceOf(TestProvider);
      expect(routeModuleInstance).property('_testController').instanceOf(TestController);
    });
  });
  describe('@Inject', () => {
    beforeEach(() => {
      sinon.stub(ErrorsZone, 'asyncRun').callsFake(async (cb) => await cb());
    });
    class InjectablesClass {}
    it('should inject provider in property', async () => {
      @Injectable()
      class TestService {}
      @Injectable()
      class TestController {
        public testService: TestService;
        constructor(@Inject(TestService) testService: TestService) {
          this.testService = testService;
        }
      }
      @Module({
        providers: [TestService],
        controllers: [TestController],
      })
      class AppModule {}
      const ctx = await UzertFactory.createApplicationContext(AppModule);
      const controller = ctx.get(TestController);
      expect(controller).property('testService').instanceOf(TestService);
    });
    it('should reflect type from function name', () => {
      class TestService {
        constructor(@Inject(InjectablesClass) injectableClass) {}
      }
      const injections = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, TestService);
      expect(injections).to.eql([{ index: 0, param: InjectablesClass.name }]);
    });
    it('should reflect type from string or other types', () => {
      class TestService {
        constructor(@Inject('InjectablesClass') injectablesClass) {}
      }
      const injections = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, TestService);
      expect(injections).to.eql([{ index: 0, param: InjectablesClass.name }]);
    });
    it('should throw an error if dependency not found and it is not optional', async () => {
      const stubProcessAbort = sinon.stub(process, 'abort');
      class TestServiceOptional {
        constructor(@Inject(InjectablesClass) test: InjectablesClass) {}
      }
      @Module({
        providers: [TestServiceOptional],
      })
      class AppModule {}
      await UzertFactory.createApplicationContext(AppModule);
      expect(stubProcessAbort.calledOnce).to.be.true;
    });
    it('should return undefined for optional props', async () => {
      class TestServiceOptional {
        public test: InjectablesClass;
        constructor(@Optional() @Inject(InjectablesClass) test: InjectablesClass) {
          this.test = test;
        }
      }
      @Module({
        providers: [TestServiceOptional],
      })
      class AppModule {}
      const ctx = await UzertFactory.createApplicationContext(AppModule);
      const testService = ctx.get(TestServiceOptional);
      expect(testService.test).is.undefined;
    });
    describe('class properties', () => {
      class TestService {
        @Inject() test: InjectablesClass;
      }
      it('should inject in class properties', () => {
        const injections = Reflect.getMetadata(PROPERTY_DEPS_METADATA, TestService);
        expect(injections).to.eql([{ key: 'test', type: 'InjectablesClass' }]);
      });
      it('should initiate classes from class properties', async () => {
        @Module({
          providers: [TestService, InjectablesClass],
        })
        class AppModule {}
        const ctx = await UzertFactory.createApplicationContext(AppModule);
        const testService = ctx.get(TestService);
        expect(testService.test).instanceOf(InjectablesClass);
      });
      it('if injectable was not found and it not optional should throw an error', async () => {
        const stubProcessAbort = sinon.stub(process, 'abort');
        @Module({
          providers: [TestService],
        })
        class AppModule {}
        const ctx = await UzertFactory.createApplicationContext(AppModule);
        ctx.get(TestService);
        expect(stubProcessAbort.calledOnce).to.be.true;
      });
      it(`if injectable was not found and it's optional should return undefined`, async () => {
        class TestServiceOptional {
          @Optional() @Inject() test: InjectablesClass;
        }
        @Module({
          providers: [TestServiceOptional],
        })
        class AppModule {}
        const ctx = await UzertFactory.createApplicationContext(AppModule);
        const testService = ctx.get(TestServiceOptional);
        expect(testService.test).is.undefined;
      });
    });
  });
});
