import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import * as sinon from 'sinon';
import { PinoLogger } from '../../loggers';

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
      const pino = new PinoLogger({
        extremeMode: {
          enabled: true,
          tick: 5000,
        },
      });
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
    it('should call final logger when dispose is called', async () => {
      const pino = new PinoLogger({
        extremeMode: {
          enabled: true,
        },
      });
      const stubFinalLogger = sinon.spy(pino, <any>'_finalLogger');
      await pino.dispose('SIGINT');
      expect(stubFinalLogger.calledOnce).to.be.true;
    });
    it('should log if error occurred', async () => {
      const pino = new PinoLogger({
        extremeMode: {
          enabled: true,
        },
      });
      const stubFinalLogger = sinon.spy(pino, <any>'_finalLogger');
      const testError = new Error('test error');
      await pino.dispose('uncaughtException', testError);
      expect(stubFinalLogger.calledOnceWith(testError)).to.be.true;
    });
  });
});
