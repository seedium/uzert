import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { Module } from '../../injector/module';
import { Provider } from '../../interfaces';
import { UnknownExportError } from '../../errors';
import { UzertContainer, ModuleRef } from '../../injector';

chai.use(sinonChai);
const expect = chai.expect;

describe('Module', () => {
  class AppModule {}
  let module: Module;
  class RelatedModule {
    static for() {
      return {
        module: RelatedModule,
      };
    }
  }
  let relatedModule: Module;
  class TestProvider {
    static for(): Provider {
      return {
        provide: TestProvider,
        useFactory: () => {
          return new TestProvider();
        },
      };
    }
  }
  beforeEach(() => {
    const container = new UzertContainer();
    module = new Module(AppModule, container);
    relatedModule = new Module(RelatedModule, container);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('creating module', () => {
    it('should add module as provider', () => {
      expect(module.providers.size).eq(2);
      expect(module.providers.has(AppModule.name)).is.true;
      const moduleProvider = module.providers.get(AppModule.name);
      expect(moduleProvider.name).eq(AppModule.name);
      expect(moduleProvider.metatype).eq(AppModule);
      expect(moduleProvider.host).eq(module);
    });
    it('should add module ref to providers', () => {
      expect(module.providers.has(ModuleRef.name)).is.true;
      const moduleRefProvider = module.providers.get(ModuleRef.name);
      expect(moduleRefProvider.metatype).eq(ModuleRef);
      expect(moduleRefProvider.instance).not.null;
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
  describe('add providers', () => {
    it('should create new instance wrapper for type provider', () => {
      const spyIsCustomProvider = sinon.spy(module, 'isCustomProvider');
      module.addProvider(TestProvider);
      expect(spyIsCustomProvider).returned(false);
      expect(module.providers.has(TestProvider.name)).is.true;
      const instanceWrapper = module.providers.get(TestProvider.name);
      expect(instanceWrapper.metatype).eq(TestProvider);
      expect(instanceWrapper.name).eq(TestProvider.name);
    });
    describe('custom providers', () => {
      it('should add custom factory', () => {
        const factoryFunction = () => {
          return new TestProvider();
        };
        module.addProvider({
          provide: TestProvider,
          useFactory: factoryFunction,
        });
        const instanceWrapper = module.providers.get(TestProvider.name);
        expect(instanceWrapper.metatype).eq(factoryFunction);
        expect(instanceWrapper.name).eq(TestProvider.name);
      });
      it('should add custom class', () => {
        module.addProvider({
          provide: TestProvider,
          useClass: TestProvider,
        });
        const instanceWrapper = module.providers.get(TestProvider.name);
        expect(instanceWrapper.metatype).eq(TestProvider);
        expect(instanceWrapper.name).eq(TestProvider.name);
      });
      it('should add custom value', () => {
        const testProvider = new TestProvider();
        module.addProvider({
          provide: TestProvider.name,
          useValue: testProvider,
        });
        const instanceWrapper = module.providers.get(TestProvider.name);
        expect(instanceWrapper.instance).eq(testProvider);
        expect(instanceWrapper.name).eq(TestProvider.name);
        expect(instanceWrapper.async).is.false;
      });
      it('should add async custom value', () => {
        const testProvider = Promise.resolve(new TestProvider());
        module.addProvider({
          provide: TestProvider.name,
          useValue: testProvider,
        });
        const instanceWrapper = module.providers.get(TestProvider.name);
        expect(instanceWrapper.instance).eq(testProvider);
        expect(instanceWrapper.name).eq(TestProvider.name);
        expect(instanceWrapper.async).is.true;
      });
      it('should not add custom provider is not satisfied to any custom types', () => {
        const stubs = [
          sinon.stub(module, 'addCustomClass'),
          sinon.stub(module, 'addCustomValue'),
          sinon.stub(module, 'addCustomFactory'),
        ];
        /* @ts-expect-error */
        module.addProvider({
          provide: TestProvider,
        });
        stubs.forEach((stub) => expect(stub).not.called);
      });
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
      const result = module.validateExportedProvider(
        relatedModule.metatype.name,
      );
      expect(result).eq(RelatedModule.name);
    });
    it('should throw an unknown export error if provider not found', () => {
      expect(() =>
        module.validateExportedProvider(relatedModule.metatype.name),
      ).throws(UnknownExportError);
    });
    it('should throw an unknown export error if provider symbol token not found', () => {
      expect(() => module.validateExportedProvider(Symbol.for('test'))).throws(
        UnknownExportError,
      );
    });
  });
  describe('should add to exports', () => {
    describe('custom provider', () => {
      it('with provide property string', () => {
        class TestProviderString {
          static for(): Provider {
            return {
              provide: TestProviderString.name,
              useFactory: () => new TestProviderString(),
            };
          }
        }
        module.addProvider(TestProviderString.for());
        module.addExportedProvider(TestProviderString.for());
        expect([...module.exports.values()]).deep.eq([TestProviderString.name]);
      });
      it('with provide property symbol', () => {
        const provideSymbol = Symbol.for('TestProviderSymbol');
        class TestProviderSymbol {
          static for(): Provider {
            return {
              provide: provideSymbol,
              useFactory: () => new TestProviderSymbol(),
            };
          }
        }
        module.addProvider(TestProviderSymbol.for());
        module.addExportedProvider(TestProviderSymbol.for());
        expect([...module.exports.values()]).deep.eq([provideSymbol]);
      });
      it('with provide property simple type', () => {
        module.addProvider(TestProvider.for());
        module.addExportedProvider(TestProvider.for());
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
      module.addExportedProvider(RelatedModule.for());
      expect([...module.exports.values()]).deep.eq([RelatedModule.name]);
    });
    it('simple type', () => {
      module.addProvider(TestProvider);
      module.addExportedProvider(TestProvider);
      expect([...module.exports.values()]).deep.eq([TestProvider.name]);
    });
  });
});
