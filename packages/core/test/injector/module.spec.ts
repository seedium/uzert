import { expect } from 'chai';
import { Module } from '../../injector/module';
import { Provider } from '../../interfaces';
import { UnknownExportError } from '../../errors';

describe('Module', () => {
  class AppModule {}
  let module: Module;
  class RelatedModule {
    static boot() {
      return {
        module: RelatedModule,
      };
    }
  }
  let relatedModule: Module;
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
    module = new Module(AppModule, []);
    relatedModule = new Module(RelatedModule, []);
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
  describe('add import modules', () => {
    it(`should add related module to module's imports`, () => {
      module.addRelatedModule(relatedModule);
      expect([...module.imports.values()]).deep.eq([relatedModule]);
    });
  });
  describe('should validate exported provider', () => {
    it('if host module has exported provider', () => {
      module.addProvider(TestProvider);
      const result = module.validateExportedProvider(TestProvider.name);
      expect(result).eq(TestProvider.name);
    });
    it('if exporting module is related module', () => {
      module.addRelatedModule(relatedModule);
      const result = module.validateExportedProvider(relatedModule.metatype.name);
      expect(result).eq(RelatedModule.name);
    });
    it('should throw an unknown export error if provider not found', () => {
      expect(() => module.validateExportedProvider(relatedModule.metatype.name)).throws(UnknownExportError);
    });
    it('should throw an unknown export error if provider symbol token not found', () => {
      expect(() => module.validateExportedProvider(Symbol.for('test'))).throws(UnknownExportError);
    });
  });
  describe('should add to exports', () => {
    describe('custom provider', () => {
      it('with provide property string', () => {
        class TestProviderString {
          static boot(): Provider {
            return {
              provide: TestProviderString.name,
              useFactory: () => new TestProviderString(),
            };
          }
        }
        module.addProvider(TestProviderString.boot());
        module.addExportedProvider(TestProviderString.boot());
        expect([...module.exports.values()]).deep.eq([TestProviderString.name]);
      });
      it('with provide property symbol', () => {
        const provideSymbol = Symbol.for('TestProviderSymbol');
        class TestProviderSymbol {
          static boot(): Provider {
            return {
              provide: provideSymbol,
              useFactory: () => new TestProviderSymbol(),
            };
          }
        }
        module.addProvider(TestProviderSymbol.boot());
        module.addExportedProvider(TestProviderSymbol.boot());
        expect([...module.exports.values()]).deep.eq([provideSymbol]);
      });
      it('with provide property simple type', () => {
        module.addProvider(TestProvider.boot());
        module.addExportedProvider(TestProvider.boot());
        expect([...module.exports.values()]).deep.eq([TestProvider.name]);
      });
    });
    it('string or symbol type', () => {
      module.addProvider(TestProvider);
      module.addExportedProvider(TestProvider.name);
      expect([...module.exports.values()]).deep.eq([TestProvider.name]);
    });
    it('dynamic module', () => {
      module.addRelatedModule(relatedModule);
      module.addExportedProvider(RelatedModule.boot());
      expect([...module.exports.values()]).deep.eq([RelatedModule.name]);
    });
    it('simple type', () => {
      module.addProvider(TestProvider);
      module.addExportedProvider(TestProvider);
      expect([...module.exports.values()]).deep.eq([TestProvider.name]);
    });
  });
});
