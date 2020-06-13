import { expect } from 'chai';
import * as sinon from 'sinon';
import { TraceMethodTime } from '../decorators';

describe('Decorators helpers', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('TraceMethodTime', () => {
    it('should trace method', async () => {
      const stubLogger = sinon.stub();
      class TestClass {
        @TraceMethodTime({
          logger: stubLogger,
        })
        public async method() {
          this.methodToStub();
        }
        public methodToStub() {}
      }
      const stubMethod = sinon.stub(TestClass.prototype, 'methodToStub');
      const instance = new TestClass();
      await instance.method();
      expect(stubLogger.calledTwice).to.be.true;
      expect(stubLogger.calledBefore(stubMethod));
      expect(stubLogger.calledAfter(stubMethod));
    });
    it('should throw an error when using decorator not on class method', () => {
      try {
        // @ts-expect-error
        @TraceMethodTime()
        class TestClass {}
      } catch (e) {
        return;
      }
      throw new Error('Decorator should throw an error');
    });
  });
});
