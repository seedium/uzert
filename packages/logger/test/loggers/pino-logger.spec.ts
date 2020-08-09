import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { PinoLogger } from '../../lib/loggers';

chai.use(sinonChai);
const expect = chai.expect;

describe('Pino logger', () => {
  const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
  afterEach(() => {
    sinon.restore();
  });
  it('logger should initialized by default in normal mode', () => {
    const pino = new PinoLogger();
    expect(pino).property('_logger').is.not.undefined;
    expect(pino).not.property('_finalLogger');
  });
  it('all levels should work', () => {
    const pino = new PinoLogger({
      enabled: false,
    });
    levels.forEach((level) => {
      pino[level](level);
    });
  });
  it('should create child logger', () => {
    const pino = new PinoLogger({ enabled: false });
    const stubChildLogger = sinon.stub((pino as any)._logger, 'child');
    pino.child();
    expect(stubChildLogger).calledOnce;
  });
  describe('extreme mode', () => {
    it('should create pino in extreme mode', () => {
      const pino = new PinoLogger({
        extremeMode: {
          enabled: true,
        },
      });
      expect(pino).property('_logger').is.not.undefined;
      expect(pino).property('_finalLogger').is.not.undefined;
    });
    it('should set custom tick', () => {
      const stubFlushLogger = sinon.stub(
        PinoLogger.prototype,
        <any>'flushLogger',
      );
      const tick = 5000;
      new PinoLogger({
        extremeMode: {
          enabled: true,
          tick,
        },
      });
      expect(stubFlushLogger).calledOnceWith(tick);
    });
    it('should flush logs by tick', () => {
      const clock = sinon.useFakeTimers();
      const tick = 2000;
      const pino = new PinoLogger({
        extremeMode: {
          enabled: true,
          tick,
        },
      });
      const stubLoggerFlush = sinon.stub((pino as any)._logger, 'flush');
      clock.tick(tick);
      expect(stubLoggerFlush.calledOnce).to.be.true;
    });
    it('logger should disposed when application is disposing', () => {
      const pino = new PinoLogger();
      expect(pino).property('_logger').not.undefined.and.null;
      pino.onDispose();
      expect(pino).property('_logger').is.undefined;
    });
    it('final logger should work on application shutdown', () => {
      const pino = new PinoLogger({
        extremeMode: {
          enabled: true,
        },
      });
      const stubFinalLogger = sinon.stub(pino, <any>'_finalLogger');
      const testError = new Error('test');
      pino.onAppShutdown(testError);
      expect(stubFinalLogger).calledOnceWithExactly(testError, undefined);
    });
    describe('final handler', () => {
      let stubFinalLoggerInfo: sinon.SinonStub;
      let stubFinalLoggerError: sinon.SinonStub;
      let pino: PinoLogger;
      const testError = new Error('test');
      const testEvent = 'test';
      beforeEach(() => {
        stubFinalLoggerInfo = sinon.stub();
        stubFinalLoggerError = sinon.stub();
        pino = new PinoLogger();
      });
      it('should log event type', async () => {
        (pino as any).finalHandler(
          null,
          {
            info: stubFinalLoggerInfo,
            error: stubFinalLoggerError,
          },
          testEvent,
        );
        expect(stubFinalLoggerError).not.called;
        expect(stubFinalLoggerInfo).calledOnceWithExactly(
          `${testEvent} caught`,
        );
      });
      it('if error occurred log an error', async () => {
        (pino as any).finalHandler(
          testError,
          {
            info: stubFinalLoggerInfo,
            error: stubFinalLoggerError,
          },
          testEvent,
        );
        expect(stubFinalLoggerError).calledOnceWith(testError);
      });
    });
  });
});
