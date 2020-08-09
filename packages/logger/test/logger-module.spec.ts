import { expect } from 'chai';
import { DefaultLogger, PinoLogger } from '../lib/loggers';
import { LoggerModule } from '../lib';
import { FactoryProvider } from '@uzert/core';

describe('LoggerModule', function () {
  beforeEach(() => {
    process.env.UZERT_LOGGER_ENABLED = 'true';
  });
  afterEach(() => {
    process.env.UZERT_LOGGER_ENABLED = 'false';
  });
  it('should return dynamic module', () => {
    const loggerModule = LoggerModule.for();
    expect(loggerModule).deep.eq({
      module: LoggerModule,
      providers: [],
      exports: [],
    });
  });
  describe('should create', () => {
    it('default logger', () => {
      const loggerModule = LoggerModule.for({
        default: {
          enabled: true,
        },
      });
      expect(loggerModule.exports).deep.eq([DefaultLogger]);
      const [defaultLoggerFactory] = loggerModule.providers;
      expect((defaultLoggerFactory as FactoryProvider).useFactory()).instanceOf(
        DefaultLogger,
      );
      expect(defaultLoggerFactory).property('provide').eq(DefaultLogger);
    });
    it('pino logger', () => {
      const loggerModule = LoggerModule.for({
        pino: {
          enabled: true,
        },
      });
      expect(loggerModule.exports).deep.eq([PinoLogger]);
      const [pinoLoggerFactory] = loggerModule.providers;
      expect((pinoLoggerFactory as FactoryProvider).useFactory()).instanceOf(
        PinoLogger,
      );
      expect(pinoLoggerFactory).property('provide').eq(PinoLogger);
    });
  });
});
