import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { Injector } from '../../injector/injector';
import { InstanceWrapper } from '../../injector/instance-wrapper';
import { Module } from '../../injector/module';
import { UzertContainer } from '../../injector';
import { STATIC_CONTEXT } from '../../injector/injector.constants';
import { UnknownDependencyError } from '../../errors';

chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

describe('Injector', () => {
  class TestProvider {}
  class AppModule {}
  let injector: Injector;
  let module: Module;
  beforeEach(() => {
    injector = new Injector();
    module = new Module(AppModule, new UzertContainer());
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
      await expect(
        injector.loadInstance(
          instanceWrapper,
          module.providers,
          module,
          STATIC_CONTEXT,
        ),
      ).to.eventually.rejected;
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
      await injector.loadInstance(
        instanceWrapper,
        module.providers,
        module,
        STATIC_CONTEXT,
      );
      expect(stubDoneHook.calledOnce).to.be.true;
    });
  });
  describe('resolve single params', () => {
    it('should resolve by component instance', async () => {
      const stubResolveComponentInstance = sinon.stub(
        injector,
        'resolveComponentInstance',
      );
      const instanceWrapper = new InstanceWrapper();
      await injector.resolveSingleParam(
        instanceWrapper,
        'test',
        {},
        module,
        STATIC_CONTEXT,
      );
      expect(stubResolveComponentInstance.calledOnce).to.be.true;
    });
    describe('should throw an error when param token is undefined and', () => {
      it('nothing else', async () => {
        const instanceWrapper = new InstanceWrapper();
        await expect(
          injector.resolveSingleParam(
            instanceWrapper,
            undefined,
            {},
            module,
            STATIC_CONTEXT,
          ),
        ).eventually.rejectedWith(UnknownDependencyError);
      });
      it('name of instance wrapper is symbol', async () => {
        const instanceWrapper = new InstanceWrapper({
          name: Symbol.for('test'),
        });
        await expect(
          injector.resolveSingleParam(
            instanceWrapper,
            undefined,
            {},
            module,
            STATIC_CONTEXT,
          ),
        ).eventually.rejectedWith(UnknownDependencyError);
      });
      it('module metatype is undefined', async () => {
        await expect(
          injector.resolveSingleParam(
            new InstanceWrapper(),
            undefined,
            {},
            new Module(AppModule, new UzertContainer()),
            STATIC_CONTEXT,
          ),
        ).eventually.rejectedWith(UnknownDependencyError);
      });
      it('name of dependency context is symbol', async () => {
        await expect(
          injector.resolveSingleParam(
            new InstanceWrapper(),
            undefined,
            {
              name: Symbol.for('test'),
            },
            module,
            STATIC_CONTEXT,
          ),
        ).eventually.rejectedWith(UnknownDependencyError);
      });
      it('name of dependency context is null', async () => {
        await expect(
          injector.resolveSingleParam(
            new InstanceWrapper(),
            undefined,
            {
              name: null,
            },
            module,
            STATIC_CONTEXT,
          ),
        ).eventually.rejectedWith(UnknownDependencyError);
      });
      it('dependencies is undefined', async () => {
        await expect(
          injector.resolveSingleParam(
            new InstanceWrapper(),
            undefined,
            {
              index: 0,
              dependencies: undefined,
            },
            module,
            STATIC_CONTEXT,
          ),
        ).eventually.rejectedWith(UnknownDependencyError);
      });
      it('module type is undefined should output "current" in error message', async () => {
        /* @ts-expect-error */
        module._metatype = undefined;
        await expect(
          injector.resolveSingleParam(
            new InstanceWrapper(),
            undefined,
            {},
            module,
            STATIC_CONTEXT,
          ),
        ).eventually.rejectedWith(UnknownDependencyError);
      });
    });
  });
  describe('resolve component host', () => {
    it('should not load provider if resolved', async () => {
      const stubLoadProvider = sinon.stub(injector, 'loadProvider');
      await injector.resolveComponentHost(
        module,
        new InstanceWrapper({
          instance: null,
          isResolved: true,
        }),
        STATIC_CONTEXT,
      );
      expect(stubLoadProvider).not.called;
    });
    it('should load provider if not resolved', async () => {
      const stubLoadProvider = sinon.stub(injector, 'loadProvider');
      await injector.resolveComponentHost(
        module,
        new InstanceWrapper({
          instance: null,
          isResolved: false,
        }),
        STATIC_CONTEXT,
      );
      expect(stubLoadProvider).called;
    });
    it('should await instance if wrapper is async', async () => {
      const test = { foo: 'bar' };
      const instanceWrapper = new InstanceWrapper({
        instance: Promise.resolve(test),
        isResolved: true,
        async: true,
      });
      const resultInstanceWrapper = await injector.resolveComponentHost(
        module,
        instanceWrapper,
        STATIC_CONTEXT,
      );
      expect(resultInstanceWrapper.instance).eq(test);
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
      await injector.resolveComponentInstance(
        module,
        'test',
        {},
        instanceWrapper,
        STATIC_CONTEXT,
      );
      expect(stubLookupComponent).to.have.been.calledOnce;
      const [injectables] = stubLookupComponent.firstCall.args;
      expect(injectables.size).eq(3);
      expect(injectables.has(TestProvider.name)).to.be.true;
      expect(!injectables.has(TestController.name)).to.be.true;
    });
  });
  describe('lookup component in parent modules', () => {
    it(`if component not found in root module should lookup in parent modules`, async () => {
      const stubLookupComponentInParentModules = sinon.stub(
        injector,
        'lookupComponentInParentModules',
      );
      await injector.lookupComponent(
        module.providers,
        module,
        {
          name: TestProvider.name,
        },
        new InstanceWrapper(),
        STATIC_CONTEXT,
      );
      expect(stubLookupComponentInParentModules).calledOnce;
    });
    it('if component not found in parent modules should throw an error', async () => {
      await expect(
        injector.lookupComponentInParentModules(
          {
            name: TestProvider.name,
          },
          module,
          new InstanceWrapper(),
          STATIC_CONTEXT,
        ),
      ).to.eventually.rejectedWith(UnknownDependencyError);
    });
    it('should use static context by default in `lookupComponentInParentModules`', async () => {
      sinon
        .stub(injector, 'lookupComponentInImports')
        .resolves(new InstanceWrapper());
      await injector.lookupComponentInParentModules(
        {
          name: TestProvider.name,
        },
        module,
        new InstanceWrapper(),
      );
    });
    describe('lookup in imports', () => {
      class TestModule {}
      class SecondTestModule {}
      let container: UzertContainer;
      beforeEach(() => {
        container = new UzertContainer();
      });
      it('should find component in other module providers', async () => {
        const relatedModule = new Module(TestModule, container);
        relatedModule.addProvider(TestProvider);
        relatedModule.addExportedProvider(TestProvider);
        module.addRelatedModule(relatedModule);
        const component = await injector.lookupComponentInParentModules(
          {
            name: TestProvider.name,
            dependencies: [],
          },
          module,
          new InstanceWrapper(),
          STATIC_CONTEXT,
        );
        expect(component).not.null;
        expect(component.instance).instanceOf(TestProvider);
      });
      it('should find component in exports imported module', async () => {
        const secondRelatedModule = new Module(SecondTestModule, container);
        secondRelatedModule.addProvider(TestProvider);
        secondRelatedModule.addExportedProvider(TestProvider);
        const relatedModule = new Module(TestModule, container);
        relatedModule.addRelatedModule(secondRelatedModule);
        relatedModule.addExportedProvider(SecondTestModule);
        module.addRelatedModule(relatedModule);
        const component = await injector.lookupComponentInImports(
          module,
          TestProvider.name,
          new InstanceWrapper(),
        );
        expect(component.instance).instanceOf(TestProvider);
      });
      it('should resolve `null` if component not found in any imports', async () => {
        const secondRelatedModule = new Module(SecondTestModule, container);
        const relatedModule = new Module(TestModule, container);
        relatedModule.addRelatedModule(secondRelatedModule);
        module.addRelatedModule(relatedModule);
        const component = await injector.lookupComponentInImports(
          module,
          'test',
          new InstanceWrapper(),
        );
        expect(component).is.null;
      });
      it('should not load provider if it already resolved', async () => {
        const relatedModule = new Module(TestModule, container);
        relatedModule.addProvider(TestProvider);
        relatedModule.addExportedProvider(TestProvider);
        const instanceWrapper = relatedModule.providers.get(TestProvider.name);
        sinon.stub(instanceWrapper, 'getInstanceByContextId').returns({
          instance: new TestProvider(),
          isResolved: true,
        });
        const stubLoadProvider = sinon.stub(injector, 'loadProvider');
        module.addRelatedModule(relatedModule);
        await injector.lookupComponentInImports(
          module,
          TestProvider.name,
          new InstanceWrapper(),
        );
        expect(stubLoadProvider).not.called;
      });
      it('should not processing module if already done', async () => {
        class ThirdTestModule {}
        const relatedModule = new Module(TestModule, container);
        const secondRelatedModule = new Module(SecondTestModule, container);
        const thirdRelatedModule = new Module(ThirdTestModule, container);
        secondRelatedModule.addRelatedModule(relatedModule);
        secondRelatedModule.addExportedProvider(TestModule);
        thirdRelatedModule.addRelatedModule(relatedModule);
        thirdRelatedModule.addExportedProvider(TestModule);
        module.addRelatedModule(secondRelatedModule);
        module.addRelatedModule(thirdRelatedModule);
        const spyLookupComponentInImports = sinon.spy(
          injector,
          'lookupComponentInImports',
        );
        await injector.lookupComponentInImports(
          module,
          'test',
          new InstanceWrapper(),
        );
        expect(spyLookupComponentInImports).callCount(4);
      });
    });
    describe('when call `lookupComponentInImports`', () => {
      it('without module registry, by default should be empty array', async () => {
        await injector.lookupComponentInImports(
          module,
          TestProvider.name,
          new InstanceWrapper(),
        );
      });
      it('without context id, be default should use static context', async () => {
        await injector.lookupComponentInImports(
          module,
          TestProvider.name,
          new InstanceWrapper(),
          [],
        );
      });
    });
  });
});
