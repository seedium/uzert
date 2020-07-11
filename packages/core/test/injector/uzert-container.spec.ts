import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinon from 'sinon';
import { UzertContainer } from '../../injector';
import { CircularDependencyError, InvalidModuleError, UnknownModuleError } from '../../errors';
import { RouteModule } from '../../interfaces';

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
      expect(() => container.addProvider(undefined, 'test')).throws(CircularDependencyError);
    });
    it('should throw an error when add controller', () => {
      expect(() => container.addController(undefined, 'test')).throws(CircularDependencyError);
    });
    it('should throw an error when add route', () => {
      expect(() => container.addRoute(undefined, 'test')).throws(CircularDependencyError);
    });
  });
  describe('if module was not found', () => {
    class TestProvider {}
    class TestRouter implements RouteModule {
      public register(): any {}
    }
    it('should throw an error on add provider', () => {
      expect(() => container.addProvider(TestProvider, 'unknown')).throws(UnknownModuleError);
    });
    it('should throw an error on add controller', () => {
      expect(() => container.addController(TestProvider, 'unknown')).throws(UnknownModuleError);
    });
    it('should throw an error on add route', () => {
      expect(() => container.addRoute(TestRouter, 'unknown')).throws(UnknownModuleError);
    });
    it('should throw an error on add injectables', () => {
      expect(() => container.addInjectable(TestProvider, 'unknown')).throws(UnknownModuleError);
    });
    it('should throw an error if module is undefined', () => {
      expect(() => container.addProvider(TestProvider, undefined)).throws(UnknownModuleError);
    });
  });
  describe('add module', () => {
    it('if metatype is undefined should throw an error', async () => {
      expect(container.addModule(undefined, [])).to.eventually.rejectedWith(InvalidModuleError);
    });
    it('if module exits dont override', async () => {
      class AppModule {}
      const spyModuleSet = sinon.spy((container as any).modules, 'set');
      await container.addModule(AppModule, []);
      await container.addModule(AppModule, []);
      expect(spyModuleSet.calledOnce).to.be.true;
    });
  });
  describe('get module', () => {
    it('if undefined passed to get module token should throw an error', async () => {
      expect(container.getModuleToken(undefined)).eventually.rejectedWith(InvalidModuleError);
    });
  });
});