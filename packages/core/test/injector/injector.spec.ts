import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { Injector } from '../../injector/injector';
import { InstanceWrapper } from '../../injector/instance-wrapper';
import { Module } from '../../injector/module';
import { STATIC_CONTEXT } from '../../injector/injector.constants';
import { UnknownDependencyError } from '../../errors';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

describe('Injector', () => {
  class TestProvider {}
  let injector: Injector;
  let module: Module;
  beforeEach(() => {
    injector = new Injector();
    class AppModule {}
    module = new Module(AppModule, []);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('loading prototype', () => {
    it('when collection is undefined, should return', () => {
      const instanceWrapper = new InstanceWrapper();
      injector.loadPrototype(instanceWrapper, undefined);
    });
  });
  describe('loading instance', () => {
    it('if target wrapper is undefined should throw an error', async () => {
      const instanceWrapper = new InstanceWrapper({
        instance: undefined,
        isResolved: false,
      });
      expect(injector.loadInstance(instanceWrapper, module.providers, module, STATIC_CONTEXT)).to.eventually.rejected;
    });
    it('if instance resolved call done hook', async () => {
      module.addProvider(TestProvider);
      const instanceWrapper = new InstanceWrapper({
        name: TestProvider.name,
        instance: Object.create(TestProvider),
        isResolved: true,
      });
      const stubDoneHook = sinon.stub();
      sinon.stub(injector, 'applyDoneHook').returns(stubDoneHook);
      await injector.loadInstance(instanceWrapper, module.providers, module, STATIC_CONTEXT);
      expect(stubDoneHook.calledOnce).to.be.true;
    });
  });
  describe('resolve single params', () => {
    it('should resolve by component instance', async () => {
      const stubResolveComponentInstance = sinon.stub(injector, 'resolveComponentInstance');
      const instanceWrapper = new InstanceWrapper();
      await injector.resolveSingleParam(instanceWrapper, 'test', {}, module, STATIC_CONTEXT);
      expect(stubResolveComponentInstance.calledOnce).to.be.true;
    });
    it('should throw error if param token is undefined', async () => {
      const instanceWrapper = new InstanceWrapper();
      expect(
        injector.resolveSingleParam(instanceWrapper, undefined, {}, module, STATIC_CONTEXT),
      ).eventually.rejectedWith(UnknownDependencyError);
    });
  });
  describe('resolve component instance', () => {
    it('by default should resolve in providers collection', async () => {
      class TestProvider {}
      class TestController {}
      const instanceWrapper = new InstanceWrapper();
      module.addProvider(TestProvider);
      module.addController(TestController);
      const stubLookupComponent = sinon.stub(injector, 'lookupComponent');
      sinon.stub(injector, 'resolveComponentHost');
      await injector.resolveComponentInstance(module, 'test', {}, instanceWrapper, STATIC_CONTEXT);
      expect(stubLookupComponent).to.have.been.calledOnce;
      const [injectables] = stubLookupComponent.firstCall.args;
      expect(injectables.size).eq(1);
      expect(injectables.has(TestProvider.name)).to.be.true;
      expect(!injectables.has(TestController.name)).to.be.true;
    });
  });
});
