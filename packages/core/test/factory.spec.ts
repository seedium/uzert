import * as sinon from 'sinon';
import { expect } from 'chai';
import { UzertFactory } from '../uzert-factory';
import { Injectable } from '../decorators';
import { Module } from '../decorators';
import { UzertApplicationContext } from '../uzert-application-context';
import { Provider } from '../interfaces';

@Injectable()
class TestProvider3 {
  public foo(): string {
    return 'bar';
  }
}

@Injectable()
class TestProvider2 {
  static boot(options?: any): Provider<TestProvider2> {
    return {
      provide: TestProvider2,
      inject: [TestProvider3],
      useFactory: async (testProvider3: TestProvider3) => {
        return new TestProvider2(options, testProvider3);
      },
    };
  }

  private readonly _options: any;

  constructor(options: any, public readonly testProvider3: TestProvider3) {
    this._options = options;
  }

  public hello(): string {
    return this._options;
  }
}

@Injectable()
class TestProvider {
  static boot() {}

  constructor(public testProvider2: TestProvider2) {}
}

let customOptions = {
  customOption: true,
};

@Module({
  providers: [TestProvider, TestProvider2.boot(customOptions), TestProvider3],
})
class AppModule {
  constructor() {}
}

describe('Factory', () => {
  const sandbox = sinon.createSandbox();

  beforeEach(() => {});

  afterEach(() => {
    sandbox.restore();
  });

  it('should create new container for core module');

  it('should return fastify application');

  it('should return application context', async () => {
    const ctx = await UzertFactory.createApplicationContext(AppModule);
    expect(ctx).not.undefined;
    expect(ctx).instanceOf(UzertApplicationContext);
  });

  it('should create new container for each application context');

  it('should initialize providers in application context');

  it('should initialize new instance loader with created container for context');

  it('should initialize new dependencies scanner with created container for context');

  it('should create error zone when scan dependencies was run');

  it('should resolve TestProvider on first level dependencies by token', async () => {
    const ctx = await UzertFactory.createApplicationContext(AppModule);
    const testProvider = await ctx.resolve<TestProvider>('TestProvider');
    expect(testProvider).not.undefined;
    expect(testProvider).instanceOf(TestProvider);
  });

  it('should resolve TestProvider on first level dependencies by type', async () => {
    const ctx = await UzertFactory.createApplicationContext(AppModule);
    const testProvider = await ctx.resolve<TestProvider>(TestProvider);
    expect(testProvider).not.undefined;
    expect(testProvider).instanceOf(TestProvider);
  });

  it('should resolve TestProvider2 on second level dependencies by token');

  it('should resolve TestProvider2 on second level dependencies by type', async () => {
    const ctx = await UzertFactory.createApplicationContext(AppModule);
    const testProvider2 = await ctx.resolve<TestProvider2>(TestProvider2);
    expect(testProvider2).not.undefined;
    expect(testProvider2).instanceOf(TestProvider2);
  });

  it('should be singleton', async () => {
    const ctx = await UzertFactory.createApplicationContext(AppModule);
    const testProvider = await ctx.resolve<TestProvider>(TestProvider);
    const testProvider2 = await ctx.resolve<TestProvider>(TestProvider);
    expect(testProvider).eq(testProvider2);
  });

  it('should not resolve if @Injectable decorator was not specified');

  it('should not resolve if @Injectable decorator was specified but not added to module providers');

  it('should use factory for creating providers', async () => {
    const ctx = await UzertFactory.createApplicationContext(AppModule);
    const testProvider = await ctx.get<TestProvider>(TestProvider);
    expect(testProvider).instanceOf(TestProvider);
    expect(testProvider).haveOwnProperty('testProvider2').instanceOf(TestProvider2);
    expect(testProvider.testProvider2.hello()).deep.eq(customOptions);
    expect(testProvider.testProvider2).haveOwnProperty('testProvider3').instanceOf(TestProvider3);
  });
});
