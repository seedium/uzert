import * as sinon from 'sinon';
import { expect } from 'chai';
import { UzertFactory } from '../uzert-factory';
import { Injectable, Module } from '../decorators';
import { UzertApplicationContext } from '../uzert-application-context';
import { UzertApplication } from '../uzert-application';
import { MockedHttpAdapter } from './utils';
import { FactoryProvider } from '../interfaces';
import { InstanceLoader } from '../injector';
import { ErrorsZone } from '../errors/handlers/errors-zone';

describe('Factory', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should create application context', async () => {
    @Module({})
    class AppModule {}
    const ctx = await UzertFactory.createApplicationContext(AppModule);
    expect(ctx).not.undefined;
    expect(ctx).instanceOf(UzertApplicationContext);
  });
  describe('UzertApplication', () => {
    @Injectable()
    class TestService {}
    @Module({
      controllers: [],
      providers: [TestService],
    })
    class AppModule {}
    it('should create uzert application', async () => {
      const app = await UzertFactory.create(AppModule, new MockedHttpAdapter());
      expect(app).not.undefined;
      expect(app).instanceOf(UzertApplication);
    });
  });
  describe('When working with two context', () => {
    let ctx1: UzertApplicationContext;
    let ctx2: UzertApplicationContext;
    @Injectable()
    class TestService {}
    @Module({
      providers: [TestService],
    })
    class AppModule {}
    beforeEach(async () => {
      ctx1 = await UzertFactory.createApplicationContext(AppModule);
      ctx2 = await UzertFactory.createApplicationContext(AppModule);
    });
    it('should create new container for each application context', () => {
      expect(ctx1).not.eq(ctx2);
    });
    it('injected classes should be different', async () => {
      const testProvider1 = await ctx1.get(TestService);
      const testProvider2 = await ctx2.get(TestService);
      expect(testProvider1).not.eq(testProvider2);
    });
  });
  describe('initialization', () => {
    @Module({})
    class AppModule {}
    it('should abort process if injection falls', async () => {
      const stubProcessAbort = sinon.stub(process, 'abort');
      sinon
        .stub(InstanceLoader.prototype, 'createInstancesOfDependencies')
        .rejects(new Error('test'));
      sinon.stub(ErrorsZone, 'asyncRun').callsFake(async (cb) => await cb());
      await UzertFactory.create(AppModule, new MockedHttpAdapter());
      expect(stubProcessAbort.calledOnce).to.be.true;
    });
    it('should create error zone for prop in adapter', async () => {
      const app = await UzertFactory.create(AppModule, new MockedHttpAdapter());
      const stubCreateErrorZone = sinon.spy(
        UzertFactory,
        <any>'createErrorZone',
      );
      /* @ts-expect-error */
      await app.run();
      expect(stubCreateErrorZone.calledOnce).to.be.true;
    });
  });
  it('should use factory http adapter', async () => {
    class CustomHttpAdapter extends MockedHttpAdapter {
      static boot(): FactoryProvider {
        return {
          provide: CustomHttpAdapter,
          useFactory: () => {
            return new CustomHttpAdapter();
          },
        };
      }
    }
    @Module({})
    class AppModule {}
    const app = await UzertFactory.create(AppModule, CustomHttpAdapter.boot());
    expect(app).instanceOf(UzertApplication);
    expect(app.httpAdapter).instanceOf(CustomHttpAdapter);
  });
});
