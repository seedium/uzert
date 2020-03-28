import { expect } from 'chai';
import { Module } from '../';
import { MODULE_KEYS } from '../constants';
import { ModuleValidationError } from '../errors';

describe('Boot module', () => {
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
        // @ts-ignore
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
    class TestProvider {
      static boot(): TestProvider {
        return new TestProvider();
      }
    }

    @Module({
      providers: [TestProvider],
      controllers: [],
    })
    class AppModule {}
    const metadataProviders = Reflect.getMetadata(MODULE_KEYS.PROVIDERS, AppModule);
    expect(metadataProviders).length(1);
    const [TestProviderMeta] = metadataProviders;
    expect(TestProviderMeta).eq(TestProvider);
  });

  it('should inject controllers to AppModule', () => {
    class TestService {
      public someMethod(): boolean {
        return true;
      }
    }

    @Module({
      providers: [],
      controllers: [TestService],
    })
    class AppModule {}
    const metadataControllers = Reflect.getMetadata(MODULE_KEYS.CONTROLLERS, AppModule);
    expect(metadataControllers).length(1);
    const [TestControllerMeta] = metadataControllers;
    expect(TestControllerMeta).eq(TestService);
  });
});
