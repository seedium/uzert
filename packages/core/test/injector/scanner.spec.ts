import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { DependenciesScanner, UzertContainer } from '../../injector';

chai.use(sinonChai);
const expect = chai.expect;

describe('Scanner', () => {
  class TestProvider {}
  let testProvider: TestProvider;
  let scanner: DependenciesScanner;
  beforeEach(() => {
    const container = new UzertContainer();
    testProvider = new TestProvider();
    scanner = new DependenciesScanner(container);
  });
  it('should miss in reflecting dynamic metadata if obj undefined', () => {
    const stubReflectInjectables = sinon.stub(scanner, 'reflectInjectables');
    scanner.reflectDynamicMetadata(undefined, 'test');
    expect(stubReflectInjectables).to.have.been.not.called;
  });
  describe('reflecting key metadata', () => {
    it('if method not found should return undefined', () => {
      const metadataKeys = scanner.reflectKeyMetadata(TestProvider, 'testKey', 'testMethod');
      expect(metadataKeys).is.undefined;
    });
  });
});