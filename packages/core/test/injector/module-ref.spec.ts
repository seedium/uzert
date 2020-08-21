import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { ProviderToken, Type } from '../../interfaces';
import {
  ModuleRef as ModuleRefAbstract,
  UzertContainer,
  InstanceLoader,
  ModuleRef,
} from '../../injector';
import { Module } from '../../injector/module';
import { Injectable } from '../../decorators';

chai.use(sinonChai);
const expect = chai.expect;

describe('ModuleRef', () => {
  let container: UzertContainer;
  let instanceLoader: InstanceLoader;
  beforeEach(() => {
    container = new UzertContainer();

    instanceLoader = new InstanceLoader(container);
  });
  describe('module ref creating', () => {
    class AppModule {}
    let module: Module;
    let moduleRef: ModuleRefAbstract;
    beforeEach(() => {
      module = new Module(AppModule, container);
      class ModuleRef extends ModuleRefAbstract {
        public get<TInput = unknown, TResult = TInput>(
          typeOrToken: ProviderToken<TInput>,
          options?: { strict: boolean },
        ): TResult {
          return this.find(typeOrToken, module);
        }
      }
      moduleRef = new ModuleRef(container);
    });
    it('should find in container with context module', () => {
      const stubContainerScannerFind = sinon.stub(
        (moduleRef as any).containerScanner,
        'find',
      );
      const testToken = 'test';
      moduleRef.get(testToken);
      expect(stubContainerScannerFind).calledOnceWithExactly(testToken, module);
    });
  });
  describe('resolving module ref', () => {
    @Injectable()
    class AppModule {
      constructor(public moduleRef: ModuleRef) {}
    }
    let module: Module;
    let moduleToken: string;
    beforeEach(async () => {
      await container.addModule(AppModule as Type<AppModule>, []);
      moduleToken = await container.getModuleToken(
        AppModule as Type<AppModule>,
      );
    });
    it('should resolve module ref in module', async () => {
      await instanceLoader.createInstancesOfDependencies();
      module = container.getModuleByToken(moduleToken);
      const moduleInstance = module.providers.get(AppModule.name).instance;
      expect(moduleInstance).property('moduleRef').instanceOf(ModuleRef);
    });
    describe('resolving providers using moduleRef', () => {
      let moduleInstance: AppModule;
      let stubModuleRefFind: sinon.SinonStub;
      const testToken = 'test';
      beforeEach(async () => {
        await instanceLoader.createInstancesOfDependencies();
        moduleInstance = container
          .getModuleByToken(moduleToken)
          .providers.get(AppModule.name).instance as AppModule;
        stubModuleRefFind = sinon.stub(moduleInstance.moduleRef, <any>'find');
      });
      it('by default should resolve components in strict mode', () => {
        moduleInstance.moduleRef.get(testToken);
        expect(stubModuleRefFind.firstCall.args.length).eq(2);
      });
      it('can search components in flat container', () => {
        moduleInstance.moduleRef.get(testToken, { strict: false });
        expect(stubModuleRefFind.firstCall.args.length).eq(1);
      });
    });
  });
});
