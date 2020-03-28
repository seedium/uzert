import * as sinon from 'sinon';
import { expect } from 'chai';
import { UzertFactory } from '../uzert-factory';
import { Injectable } from '../decorators';
import { Module } from '../decorators';
import { UzertApplicationContext } from '../uzert-application-context';

@Injectable()
class TestProvider2 {
  static boot() {}

  public hello(): string {
    return 'world';
  }
}

@Injectable()
class TestProvider {
  static boot() {}

  constructor(public testProvider: TestProvider2) {}
}

@Module({
  providers: [TestProvider, TestProvider2],
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
});
