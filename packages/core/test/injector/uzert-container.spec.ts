import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import { UzertContainer } from '../../injector';
import {
  CircularDependencyError,
  InvalidModuleError,
  UnknownModuleError,
} from '../../errors';
import { DynamicModule, RouteModule } from '../../interfaces';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('UzertContainer', () => {
  let container: UzertContainer;
  beforeEach(() => {
    container = new UzertContainer();
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('circular dependencies', () => {
    it('should throw an error when add provider', () => {
      expect(() => container.addProvider(undefined, 'test')).throws(
        CircularDependencyError,
      );
    });
    it('should throw an error when add controller', () => {
      expect(() => container.addController(undefined, 'test')).throws(
        CircularDependencyError,
      );
    });
    it('should throw an error when add route', () => {
      expect(() => container.addRoute(undefined, 'test')).throws(
        CircularDependencyError,
      );
    });
  });
  describe('if module was not found', () => {
    class TestProvider {}
    class TestRouter implements RouteModule {
      public register(): any {}
    }
    it('should throw an error on add provider', () => {
      expect(() => container.addProvider(TestProvider, 'unknown')).throws(
        UnknownModuleError,
      );
    });
    it('should throw an error on add controller', () => {
      expect(() => container.addController(TestProvider, 'unknown')).throws(
        UnknownModuleError,
      );
    });
    it('should throw an error on add route', () => {
      expect(() => container.addRoute(TestRouter, 'unknown')).throws(
        UnknownModuleError,
      );
    });
    it('should throw an error on add injectables', () => {
      expect(() => container.addInjectable(TestProvider, 'unknown')).throws(
        UnknownModuleError,
      );
    });
    it('should throw an error if module is undefined', () => {
      expect(() => container.addProvider(TestProvider, undefined)).throws(
        UnknownModuleError,
      );
    });
  });
  describe('add module', () => {
    it('if metatype is undefined should throw an error', async () => {
      await expect(
        container.addModule(undefined, []),
      ).to.eventually.rejectedWith(InvalidModuleError);
    });
    it(`if module exits don't override`, async () => {
      class AppModule {}
      const spyModuleSet = sinon.spy((container as any).modules, 'set');
      await container.addModule(AppModule, []);
      await container.addModule(AppModule, []);
      expect(spyModuleSet.calledOnce).to.be.true;
    });
    it('should add async dynamic module', async () => {
      class AppModule {
        static async for(): Promise<DynamicModule> {
          return {
            module: AppModule,
          };
        }
      }
      await container.addModule(AppModule, []);
      expect(container.getModules().size).eq(1);
    });
  });
  describe('get module', () => {
    it('if undefined passed to get module token should throw an error', async () => {
      await expect(container.getModuleToken(undefined)).eventually.rejectedWith(
        InvalidModuleError,
      );
    });
  });
  describe('add importing modules to container', () => {
    it('should call `addRelatedModule` on host module', async () => {
      class RelatedModule {}
      class TestModule {}
      await container.addModule(TestModule, []);
      const moduleToken = await container.getModuleToken(TestModule);
      const hostModule = container.getModuleByToken(moduleToken);
      const stubAddRelatedModule = sinon.stub(hostModule, 'addRelatedModule');
      await container.addImport(RelatedModule, moduleToken);
      expect(stubAddRelatedModule).calledOnce;
    });
    it('if token was not found just miss import', async () => {
      class TestModule {}
      await container.addImport(TestModule, 'test');
    });
  });
  describe('add exported provider', () => {
    it('should throw an unknown module error', () => {
      class TestService {}
      expect(() => container.addExportedProvider(TestService, 'test')).throws(
        UnknownModuleError,
      );
    });
    it('should call `addExportedProvider` on host module', async () => {
      class TestService {}
      class TestModule {}
      await container.addModule(TestModule, []);
      const moduleToken = await container.getModuleToken(TestModule);
      const hostModule = container.getModuleByToken(moduleToken);
      const stubAddExportedProvider = sinon.stub(
        hostModule,
        'addExportedProvider',
      );
      container.addExportedProvider(TestService, moduleToken);
      expect(stubAddExportedProvider).calledOnceWithExactly(TestService);
    });
  });
});
