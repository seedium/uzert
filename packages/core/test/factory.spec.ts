import * as sinon from 'sinon';
import { expect } from 'chai';
import { UzertFactory } from '../uzert-factory';
import { Injectable, Module } from '../decorators';
import { UzertApplicationContext } from '../uzert-application-context';
import { HttpAdapter } from '../adapters';
import { UzertApplication } from '../uzert-application';
import { FactoryProvider } from '../interfaces';

describe('Factory', () => {
  @Injectable()
  class TestService {}
  @Module({
    controllers: [],
    providers: [TestService],
  })
  class AppModule {}
  afterEach(() => {
    sinon.restore();
  });

  it('should create application context', async () => {
    const ctx = await UzertFactory.createApplicationContext(AppModule);
    expect(ctx).not.undefined;
    expect(ctx).instanceOf(UzertApplicationContext);
  });
  describe('UzertApplication', () => {
    class TestHttpAdapter extends HttpAdapter {
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
      public registerRouter(...args): any {}

      protected _kernel;
    }
    it('should create uzert application with default', async () => {
      const app = await UzertFactory.create(AppModule, new TestHttpAdapter());
      expect(app).not.undefined;
      expect(app).instanceOf(UzertApplication);
    });
    it('should create uzert application with injected providers', async () => {
      const someCustomOptions = {
        foo: 'bar',
      };
      class CustomHttpAdapter extends TestHttpAdapter {
        static boot(): FactoryProvider<CustomHttpAdapter> {
          return {
            provide: CustomHttpAdapter,
            inject: [TestService],
            useFactory: (testService: TestService) => {
              return new CustomHttpAdapter(someCustomOptions, testService);
            },
          };
        }
        constructor(public options: any, public readonly testService: TestService) {
          super();
        }
      }
      const app = await UzertFactory.create<CustomHttpAdapter>(AppModule, CustomHttpAdapter.boot());
      expect(app).instanceOf(UzertApplication);
      expect(app.httpAdapter.app).is.null;
      expect(app.httpAdapter).haveOwnProperty('testService');
      expect(app.httpAdapter).haveOwnProperty('options').deep.eq(someCustomOptions);
    });
  });

  describe('When working with two context', () => {
    let ctx1: UzertApplicationContext;
    let ctx2: UzertApplicationContext;
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
});
