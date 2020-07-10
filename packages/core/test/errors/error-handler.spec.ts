import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { ErrorHandler } from '../../errors/handlers/error-handler';
import { ErrorsZone } from '../../errors/handlers/errors-zone';

chai.use(sinonChai);
const expect = chai.expect;

describe('Errors', () => {
  afterEach(() => {
    sinon.restore();
  });
  describe('ErrorHandler', () => {
    it('should handle error and use logger', () => {
      const errorHandler = new ErrorHandler();
      const stubErrorLogger = sinon.stub((ErrorHandler as any).logger, 'error');
      const error = new Error('test');
      errorHandler.handle(error);
      expect(stubErrorLogger).to.be.calledOnceWith(error.message, error.stack);
    });
  });
  describe('ErrorZone', () => {
    let stubProcessExit: sinon.SinonStub;
    let stubErrorHandler: sinon.SinonStub;
    const error = new Error('test');
    beforeEach(() => {
      stubProcessExit = sinon.stub(process, 'exit');
      stubErrorHandler = sinon.stub((ErrorsZone as any).errorHandler, 'handle');
    });
    it('should catch and exit in sync zone', () => {
      ErrorsZone.run(() => {
        throw error;
      });
      expect(stubErrorHandler).calledOnceWith(error);
      expect(stubProcessExit).calledOnceWith(1);
    });
    it('should catch and exit in async zone', async () => {
      await ErrorsZone.asyncRun(async () => Promise.reject(error));
      expect(stubErrorHandler).calledOnceWith(error);
      expect(stubProcessExit).calledOnceWith(1);
    });
  });
});
