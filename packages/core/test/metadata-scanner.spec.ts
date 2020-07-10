import { expect } from 'chai';
import { MetadataScanner } from '../metadata-scanner';

describe('Metadata scanner', () => {
  class Base {
    constructor() {}
    public testBase() {}
    get getP() {
      return '';
    }
    set setP(value) {}
  }

  class Test extends Base {
    constructor() {
      super();
    }
    get getChild() {
      return '';
    }
    set setChild(value) {}
    public test() {}
    public test2() {}
  }
  it('should return only method names', () => {
    const methods = MetadataScanner.scanFromPrototype(Test.prototype, (a) => a);
    expect(methods).to.eql(['test', 'test2', 'testBase']);
  });
});
