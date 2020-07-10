import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { ContainerScanner, UzertContainer } from '../../injector';
import { Module } from '../../injector/module';
import { UnknownElementError } from '../../errors';

chai.use(sinonChai);
const expect = chai.expect;

describe('ContainerScanner', () => {
  let containerScanner: ContainerScanner;
  class Test {
    public test() {}
  }
  let test: Test;
  beforeEach(() => {
    test = new Test();
    const container: UzertContainer = new UzertContainer();
    containerScanner = new ContainerScanner(container);
  });
  afterEach(() => {
    sinon.restore();
  });
  describe('find injectables for controller methods', () => {
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
      class AppModule {}
      const module = new Module(AppModule, []);
      expect(() => containerScanner.getWrapperCollectionPairByHost(undefined, module)).throws(UnknownElementError);
    });
  });
});
