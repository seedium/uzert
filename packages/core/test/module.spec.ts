import { expect } from 'chai';
import * as sinon from 'sinon';
import { Module, RouteModule } from '../';
import { MODULE_KEYS } from '../constants';
import { ModuleValidationError } from '../errors';

describe('Boot module', () => {
  afterEach(() => {
    sinon.restore();
  });
  it('should validate all allowed keys in @Module and ', () => {
    @Module({
      providers: [],
      controllers: [],
    })
    class AppModule {}
    expect(AppModule).instanceOf(Function);
    const metadataKeys = Reflect.getMetadataKeys(AppModule);
    expect(metadataKeys).length(2);
    expect(metadataKeys).contains(MODULE_KEYS.CONTROLLERS);
    expect(metadataKeys).contains(MODULE_KEYS.PROVIDERS);
  });
  it('should throw error if one of key provided to @Module is wrong', () => {
    try {
      @Module({
        // @ts-expect-error
        wrong: [],
      })
      class AppModule {}
    } catch (err) {
      expect(err).instanceOf(ModuleValidationError);
      return;
    }
    throw new Error('Expected do not allow further code execution');
  });
  it('should inject providers to AppModule', () => {
    class TestProvider {}
    @Module({
      providers: [TestProvider],
    })
    class AppModule {}
    const metadataProviders = Reflect.getMetadata(
      MODULE_KEYS.PROVIDERS,
      AppModule,
    );
    expect(metadataProviders).length(1);
    const [TestProviderMeta] = metadataProviders;
    expect(TestProviderMeta).eq(TestProvider);
  });
  it('should inject controllers to AppModule', () => {
    class TestController {}
    @Module({
      controllers: [TestController],
    })
    class AppModule {}
    const metadataControllers = Reflect.getMetadata(
      MODULE_KEYS.CONTROLLERS,
      AppModule,
    );
    expect(metadataControllers).length(1);
    const [TestControllerMeta] = metadataControllers;
    expect(TestControllerMeta).eq(TestController);
  });
  it('should inject routers to AppModule', () => {
    class TestRouter implements RouteModule {
      public register(): any {}
    }
    @Module({
      routes: [TestRouter],
    })
    class AppModule {}
    const metadataRouters = Reflect.getMetadata(MODULE_KEYS.ROUTES, AppModule);
    expect(metadataRouters).length(1);
    const [TestRouterMeta] = metadataRouters;
    expect(TestRouterMeta).eq(TestRouter);
  });
  it('should miss if metadata does not have own property', () => {
    const metadata = { controllers: [] };
    sinon.stub(metadata, <any>'hasOwnProperty').returns(false);
    @Module(metadata)
    class AppModule {}
    const modules = Reflect.getMetadataKeys(AppModule);
    expect(modules).length(0);
  });
});
