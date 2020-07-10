import { expect } from 'chai';
import { UzertFactory } from '../uzert-factory';
import { Injectable, Module } from '../decorators';
import { UzertApplicationContext } from '../uzert-application-context';
import { UnknownElementError } from '../errors';
import { InstanceLoader, UzertContainer, ContainerScanner } from '../injector';

describe('Injection', () => {
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
      providers: [AsyncTestProvider.boot(testOptions), TestProvider],
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
    class TestRoute {
      constructor(private readonly _testProvider: TestProvider, private readonly _testController: TestController) {}
    }
    @Module({
      providers: [TestProvider],
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
