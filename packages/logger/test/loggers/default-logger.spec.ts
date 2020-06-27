import { expect } from 'chai';
import * as sinon from 'sinon';
import { DefaultLogger } from '../../loggers';

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
});
