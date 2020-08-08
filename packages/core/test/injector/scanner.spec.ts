import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import { DependenciesScanner, UzertContainer } from '../../injector';
import { MODULE_KEYS } from '../../constants';
import {
  CircularDependencyError,
  InvalidModuleError,
  UndefinedModuleError,
} from '../../errors';
import { DynamicModule } from '../../interfaces/modules';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('Scanner', () => {
  class TestProvider {
    public testMethod() {}
  }
  let container: UzertContainer;
  let testProvider: TestProvider;
  let scanner: DependenciesScanner;
  beforeEach(() => {
    container = new UzertContainer();
    testProvider = new TestProvider();
    scanner = new DependenciesScanner(container);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('reflect injectables', () => {
    it('should miss in reflecting dynamic metadata if obj undefined', () => {
      const stubReflectInjectables = sinon.stub(scanner, 'reflectInjectables');
      scanner.reflectDynamicMetadata(undefined, 'test');
      expect(stubReflectInjectables).to.have.been.not.called;
    });
    it('should miss undefined injectables when filtering', () => {
      sinon.stub(scanner, 'reflectKeyMetadata').returns(undefined);
      const stubInsertInjectables = sinon.stub(scanner, 'insertInjectable');
      scanner.reflectDynamicMetadata(TestProvider, 'testToken');
      expect(stubInsertInjectables).not.called;
    });
  });
  describe('reflecting key metadata', () => {
    it('if method not found should return undefined', () => {
      const metadataKeys = scanner.reflectKeyMetadata(
        TestProvider,
        'testKey',
        'unknownMethod',
      );
      expect(metadataKeys).is.undefined;
    });
  });
  describe('reflecting imports', () => {
    it('should call `insertImport` on each import from reflected imports', async () => {
      class TestModule {}
      const stubInsertImport = sinon.stub(scanner, 'insertImport');
      Reflect.defineMetadata(
        MODULE_KEYS.IMPORTS,
        [TestModule, TestModule],
        TestModule,
      );
      await scanner.reflectImports(TestModule, 'test', 'test');
      expect(stubInsertImport).calledTwice;
    });
    it('should call container `addImport` on each import', async () => {
      class TestModule {}
      const stubAddImport = sinon.stub(container, 'addImport');
      await scanner.insertImport(TestModule, TestModule.name, 'test');
      expect(stubAddImport).calledOnce;
    });
    it('if related import is undefined should throw a circular dependency error', async () => {
      class TestModule {}
      await expect(
        scanner.insertImport(undefined, TestModule.name, 'test'),
      ).eventually.rejectedWith(CircularDependencyError);
    });
  });
  describe('reflecting exports', () => {
    it('should call `insertExportedProvider` on each reflected exports', () => {
      class TestModule {}
      const stubInsertExportedProvider = sinon.stub(
        scanner,
        'insertExportedProvider',
      );
      Reflect.defineMetadata(
        MODULE_KEYS.EXPORTS,
        [TestProvider, TestProvider],
        TestModule,
      );
      scanner.reflectExports(TestModule, 'test');
      expect(stubInsertExportedProvider).calledTwice;
    });
    it('`insertExportedProvider` should call container `addExportedProvider`', () => {
      const stubAddExportedProvider = sinon.stub(
        container,
        'addExportedProvider',
      );
      scanner.insertExportedProvider(TestProvider, 'test');
      expect(stubAddExportedProvider).calledOnce;
    });
  });
  describe('scan for modules', () => {
    it('if simple type module was provided should reflect imports on that', async () => {
      class TestModule {}
      const module = await scanner.scanForModules(TestModule);
      expect(module.metatype).eq(TestModule);
    });
    it('if dynamic module was provided should reflect imports on property `module`', async () => {
      class TestModule {
        static boot(): DynamicModule {
          return {
            module: TestModule,
          };
        }
      }
      await scanner.scanForModules(TestModule.boot());
    });
    it('if inner module includes undefined in imports should throw an undefined module error', async () => {
      class TestModule {
        static boot(): DynamicModule {
          return {
            module: TestModule,
            imports: [undefined],
          };
        }
      }
      await expect(
        scanner.scanForModules(TestModule.boot()),
      ).eventually.rejectedWith(UndefinedModuleError);
    });
    it('if module is undefined when dynamic module has undefined in imports should throw an error', async () => {
      sinon.stub(scanner, 'reflectMetadata').returns([undefined]);
      sinon.stub(scanner, 'insertModule');
      await expect(scanner.scanForModules(undefined)).eventually.rejectedWith(
        UndefinedModuleError,
      );
    });
    it('if inner module is falsy should throw an invalid module error', async () => {
      class TestModule {
        static boot(): DynamicModule {
          return {
            module: TestModule,
            imports: [null],
          };
        }
      }
      await expect(
        scanner.scanForModules(TestModule.boot()),
      ).eventually.rejectedWith(InvalidModuleError);
    });
    it('should scan modules for each inner imports', async () => {
      class InnerModule {}
      class TestModule {
        static boot(): DynamicModule {
          return {
            module: TestModule,
            imports: [InnerModule],
          };
        }
      }
      const spyScanForModules = sinon.spy(scanner, 'scanForModules');
      await scanner.scanForModules(TestModule.boot());
      expect(spyScanForModules).calledTwice;
      expect(spyScanForModules.secondCall).calledWith(InnerModule);
    });
    it('if importing module have already imported from another module should miss scanning', async () => {
      class InnerModule {}
      class SecondInnerModule {
        static boot(): DynamicModule {
          return {
            module: SecondInnerModule,
            imports: [InnerModule],
          };
        }
      }
      class TestModule {
        static boot(): DynamicModule {
          return {
            module: TestModule,
            imports: [InnerModule, SecondInnerModule.boot()],
          };
        }
      }
      const spyScanForModules = sinon.spy(scanner, 'scanForModules');
      await scanner.scanForModules(TestModule.boot());
      expect(spyScanForModules).calledThrice;
    });
  });
});
