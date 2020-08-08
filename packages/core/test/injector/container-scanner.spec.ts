import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { ContainerScanner, InstanceLoader, UzertContainer } from '../../injector';
import { UnknownElementError } from '../../errors';
import { ClassProvider, FactoryProvider, ValueProvider } from '../../interfaces';
import { Module } from '../../injector/module';

chai.use(sinonChai);
const expect = chai.expect;

describe('ContainerScanner', () => {
  let containerScanner: ContainerScanner;
  let container: UzertContainer;
  let moduleToken: string;
  beforeEach(async () => {
    container = new UzertContainer();
    containerScanner = new ContainerScanner(container);

    class AppModule {}
    await container.addModule(AppModule, []);
    moduleToken = await container.getModuleToken(AppModule);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('find injectables for controller methods', () => {
    class Test {
      public test() {}
    }
    let test: Test;
    beforeEach(() => {
      test = new Test();
    });
    it('should capitalize if token is string', () => {
      const stubFind = sinon.stub(containerScanner, 'find');
      containerScanner.findInjectablesPerMethodContext('test', test.test);
      expect(stubFind).to.have.been.calledWith('testTest');
    });
    it('symbols should be capitalized', () => {
      const stubFind = sinon.stub(containerScanner, 'find');
      const tokenSymbol = Symbol.for('test');
      containerScanner.findInjectablesPerMethodContext(tokenSymbol, test.test);
      expect(stubFind).to.have.been.calledWith(tokenSymbol);
    });
  });
  describe('get wrapper collection by host', () => {
    it('should throw an error if typeOrToken is wrong', () => {
      class TestModule {}
      expect(() => containerScanner.getWrapperCollectionPairByHost(undefined, new Module(TestModule, []))).throws(
        UnknownElementError,
      );
    });
  });
  describe('should resolve', () => {
    let instanceLoader: InstanceLoader;
    beforeEach(() => {
      instanceLoader = new InstanceLoader(container);
    });
    it('type providers', async () => {
      class TypeProvider {}
      container.addProvider(TypeProvider, moduleToken);
      await instanceLoader.createInstancesOfDependencies();
      const typeProvider = containerScanner.find(TypeProvider);
      expect(typeProvider).instanceOf(TypeProvider);
    });
    describe('custom', () => {
      it('factory provider', async () => {
        class TestFactoryProvider {
          static boot(): FactoryProvider {
            return {
              provide: TestFactoryProvider,
              useFactory: () => {
                return new TestFactoryProvider();
              },
            };
          }
        }
        container.addProvider(TestFactoryProvider.boot(), moduleToken);
        await instanceLoader.createInstancesOfDependencies();
        const factoryProvider = containerScanner.find(TestFactoryProvider);
        expect(factoryProvider).instanceOf(TestFactoryProvider);
      });
      it('async factory provider', async () => {
        class AsyncFactoryProvider {
          static boot(): FactoryProvider {
            return {
              provide: AsyncFactoryProvider,
              useFactory: () => Promise.resolve(new AsyncFactoryProvider()),
            };
          }
        }
        container.addProvider(AsyncFactoryProvider.boot(), moduleToken);
        await instanceLoader.createInstancesOfDependencies();
        const asyncFactoryProvider = containerScanner.find(AsyncFactoryProvider);
        expect(asyncFactoryProvider).instanceOf(AsyncFactoryProvider);
      });
      it('class provider', async () => {
        class TestClassProvider {
          static boot(): ClassProvider {
            return {
              provide: TestClassProvider,
              useClass: TestClassProvider,
            };
          }
        }
        container.addProvider(TestClassProvider.boot(), moduleToken);
        await instanceLoader.createInstancesOfDependencies();
        const testClassProvider = containerScanner.find(TestClassProvider);
        expect(testClassProvider).instanceOf(TestClassProvider);
      });
      it('value provider', async () => {
        const test = { foo: 'bar' };
        class TestValueProvider {
          static boot(): ValueProvider {
            return {
              provide: TestValueProvider,
              useValue: test,
            };
          }
        }
        container.addProvider(TestValueProvider.boot(), moduleToken);
        await instanceLoader.createInstancesOfDependencies();
        const resolvedTest = containerScanner.find(TestValueProvider);
        expect(resolvedTest).eq(test);
      });
      it('async value provider', async () => {
        const test = { foo: 'bar' };
        class AsyncTestValueProvider {
          static boot(): ValueProvider {
            return {
              provide: AsyncTestValueProvider,
              useValue: Promise.resolve(test),
            };
          }
        }
        container.addProvider(AsyncTestValueProvider.boot(), moduleToken);
        await instanceLoader.createInstancesOfDependencies();
        const resolvedTest = containerScanner.find(AsyncTestValueProvider);
        expect(await resolvedTest).eq(test);
      });
    });
    it('should resolve providers in several modules', async () => {
      class TestProvider {}
      class RelatedModule {}
      const relatedModuleToken = await container.getModuleToken(RelatedModule);
      await container.addModule(RelatedModule, []);
      container.addProvider(TestProvider, relatedModuleToken);
      await instanceLoader.createInstancesOfDependencies();
      const result = containerScanner.find(TestProvider);
      expect(result).instanceOf(TestProvider);
    });
  });
});
