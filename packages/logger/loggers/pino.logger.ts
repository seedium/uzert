import * as pino from 'pino';
import { ExtendedPinoOptions } from '../interfaces';

export const createPino = (options: ExtendedPinoOptions): pino.Logger => {
  let logger: pino.Logger;

  if (options.extremeMode.enabled) {
    const extremeModeTick = options.extremeMode.tick ?? 10000;
    logger = pino(options, pino.extreme());
    logger.info('Pino extreme mode is enabled');

    setInterval(function () {
      logger.flush();
    }, extremeModeTick).unref();

    const handler = pino.final(logger, (err, finalLogger, evt) => {
      finalLogger.info(`${evt} caught`);

      if (err) {
        finalLogger.error(err, 'error caused exit');
      }

      process.exit(err ? 1 : 0);
    });

    process.on('beforeExit', () => handler(null, 'beforeExit'));
    process.on('exit', () => handler(null, 'exit'));
    process.on('uncaughtException', (err) => handler(err, 'uncaughtException'));
    process.on('SIGINT', () => handler(null, 'SIGINT'));
    process.on('SIGQUIT', () => handler(null, 'SIGQUIT'));
    process.on('SIGTERM', () => handler(null, 'SIGTERM'));
  } else {
    logger = pino(options);
  }

  return logger;
};
