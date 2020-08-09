import { expect } from 'chai';
import * as sinon from 'sinon';
import { DefaultLogger } from '../../lib/loggers';

describe('Default logger', () => {
  afterEach(() => {
    sinon.restore();
  });
  const levels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'];
  it('all logger levels should call protected method', () => {
    const defaultLogger = new DefaultLogger();
    const stubCall = sinon.stub(defaultLogger, <any>'call');
    levels.forEach((level) => {
      defaultLogger[level](level);
    });
    expect(stubCall.callCount).eq(levels.length);
  });
  it('logger can be disabled via options', () => {
    process.env.UZERT_LOGGER_ENABLED = 'true';
    new DefaultLogger({
      enabled: false,
    });
  });
  it('default logger should enabled by default', () => {
    const defaultLogger = new DefaultLogger();
    const stubLogFunc = sinon.stub();
    // @ts-expect-error
    defaultLogger.call(stubLogFunc, 'test');
    expect(stubLogFunc.calledOnce).to.be.true;
  });
  it('should create new logger when child is called', () => {
    const defaultLogger = new DefaultLogger();
    const childDefaultLogger = defaultLogger.child();
    expect(childDefaultLogger).instanceOf(DefaultLogger);
    expect(childDefaultLogger).not.eq(defaultLogger);
  });
  describe('default logger can be disabled', () => {
    it('via arguments options', () => {
      const defaultLogger = new DefaultLogger({
        enabled: false,
      });
      const stubLogFunc = sinon.stub();
      // @ts-expect-error
      defaultLogger.call(stubLogFunc, 'test');
      expect(stubLogFunc.callCount).eq(0);
    });
    it('via env `UZERT_LOGGER_ENABLED` variable', () => {
      process.env.UZERT_LOGGER_ENABLED = 'false';
      const defaultLogger = new DefaultLogger();
      const stubLogFunc = sinon.stub();
      // @ts-expect-error
      defaultLogger.call(stubLogFunc, 'test');
      expect(stubLogFunc.callCount).eq(0);
    });
  });
});
