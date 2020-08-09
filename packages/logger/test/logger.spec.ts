import * as sinon from 'sinon';
import { expect } from 'chai';
import { DefaultLogger, PinoLogger } from '../loggers';
import { Logger } from '../index';

describe('Pino default', function () {
  beforeEach(() => {
    process.env.UZERT_LOGGER_ENABLED = 'true';
  });
  afterEach(() => {
    process.env.UZERT_LOGGER_ENABLED = 'false';
  });
  it('factory function should return logger instance', () => {
    const logger = Logger.for().useFactory();
    expect(logger).instanceOf(Logger);
  });
  describe('when logger is disposing', () => {
    it('only default logger should be disposed', () => {
      const logger = new Logger({
        default: {
          enabled: true,
        },
      });
      logger.onDispose();
      expect(logger).property('_default').is.undefined;
    });
    it('all loggers should be disposed', () => {
      const logger = new Logger({
        default: {
          enabled: true,
        },
        pino: {
          enabled: true,
        },
      });
      logger.onDispose();
      expect(logger).property('_default').is.undefined;
      expect(logger).property('_pino').is.undefined;
    });
  });
  describe('when app is shutdowning', () => {
    let logger: Logger;
    beforeEach(() => {
      logger = new Logger({
        default: { enabled: false },
        pino: {
          enabled: true,
          extremeMode: {
            enabled: true,
          },
        },
      });
    });
    it('should call final logger in pino when logger on shutdown is called', async () => {
      const stubFinalLogger = sinon.spy(logger.pino, <any>'_finalLogger');
      await logger.onAppShutdown(null, 'SIGINT');
      expect(stubFinalLogger.calledOnce).to.be.true;
    });
    it('should log if error occurred', async () => {
      const stubFinalLogger = sinon.spy(logger.pino, <any>'_finalLogger');
      const testError = new Error('test error');
      await logger.onAppShutdown(testError, 'uncaughtException');
      expect(stubFinalLogger.calledOnceWith(testError)).to.be.true;
    });
  });
  it('default logger should be created by default', () => {
    const logger = new Logger();
    expect(logger).property('_default').instanceOf(DefaultLogger);
    expect(logger.default).instanceOf(DefaultLogger);
    expect(logger).not.property('_pino');
  });
  it('default logger should enabled by default', () => {
    const logger = new Logger();
    const stubLogFunc = sinon.stub();
    // @ts-expect-error
    logger.default.call(stubLogFunc, 'test');
    expect(stubLogFunc.calledOnce).to.be.true;
  });
  describe('default logger can be disabled', () => {
    it('via arguments options', () => {
      const logger = new Logger({
        default: {
          enabled: false,
        },
      });
      const stubLogFunc = sinon.stub();
      // @ts-expect-error
      logger.default.call(stubLogFunc, 'test');
      expect(stubLogFunc.callCount).eq(0);
    });
    it('via env `UZERT_LOGGER_ENABLED` variable', () => {
      process.env.UZERT_LOGGER_ENABLED = 'false';
      const logger = new Logger();
      const stubLogFunc = sinon.stub();
      // @ts-expect-error
      logger.default.call(stubLogFunc, 'test');
      expect(stubLogFunc.callCount).eq(0);
    });
  });
  it('should throw an error when try to get pino not initialized', () => {
    try {
      const logger = new Logger();
      logger.pino;
    } catch {
      return;
    }
    throw new Error('Should throw an error');
  });
  it('should init pino logger', () => {
    const logger = new Logger({
      pino: {
        enabled: true,
      },
    });
    expect(logger.pino).instanceOf(PinoLogger);
  });
});
