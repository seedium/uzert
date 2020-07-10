import { expect } from 'chai';
import { Module } from '../../injector/module';
import { Provider } from '../../interfaces';

describe('Module', () => {
  let module: Module;
  class TestProvider {
    static boot(): Provider {
      return {
        provide: TestProvider,
        useFactory: () => {
          return new TestProvider();
        },
      };
    }
  }
  beforeEach(() => {
    class AppModule {}
    module = new Module(AppModule, []);
  });
  describe('get provider instance wrapper', () => {
    it('should return by custom provider', () => {
      module.addProvider(TestProvider.boot());
      const instanceWrapper = module.getProviderInstanceWrapper(TestProvider.boot());
      expect(instanceWrapper).property('name').eq(TestProvider.name);
    });
    it('should return by type', () => {
      module.addProvider(TestProvider);
      const instanceWrapper = module.getProviderInstanceWrapper(TestProvider);
      expect(instanceWrapper).property('name').eq(TestProvider.name);
    });
  });
  describe('get provider static token', () => {
    it('should return symbol token', () => {
      const tokenSymbol = Symbol.for('test');
      const token = module.getProviderStaticToken(tokenSymbol);
      expect(token).eq(tokenSymbol);
    });
  });
  describe('add injectables', () => {
    it(`if instance wrapper doesn't exists then create new one`, () => {
      module.addInjectable(TestProvider);
      expect(module.injectables.size).eq(1);
      expect(module.injectables.has(TestProvider.name)).to.be.true;
    });
    it('if instance wrapper exists should miss', () => {
      module.addInjectable(TestProvider);
      module.addInjectable(TestProvider);
      expect(module.injectables.size).eq(1);
    });
    it('should get host wrapper from providers', () => {
      module.addProvider(TestProvider);
      module.addInjectable(TestProvider, TestProvider);
      const testProviderWrapper = module.providers.get(TestProvider.name);
      const enhancers = testProviderWrapper.getEnhancerMetadata();
      expect(enhancers).length(1);
      expect(enhancers[0].name).eq(TestProvider.name);
    });
  });
});
