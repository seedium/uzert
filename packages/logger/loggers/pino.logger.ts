import * as pino from 'pino';
import { merge } from '@uzert/helpers';
import Config from '@uzert/config';
import * as serializers from '../serializers/http-serializers';
import { ILoggerMetadata } from '../interfaces';

export const createPino = (options: pino.LoggerOptions = {}, metadata: ILoggerMetadata = {}): pino.Logger => {
  const defaultOptions = merge(
    {
      enabled: Config.get('logger:pino:enabled'),
      prettyPrint: Config.get('logger:pino:prettyPrint'),
      redact: {
        paths: ['req.headers.authorization'],
        remove: true,
      },
      level: Config.get('logger:pino:level', 'debug'),
      serializers: {
        req: serializers.request,
        res: serializers.response,
      },
      mixin: () => metadata,
    },
    options,
  );

  let logger: pino.Logger;

  if (Config.get('logger:pino:extremeMode:enabled')) {
    logger = pino(defaultOptions, pino.extreme());
    logger.info('Pino extreme mode is enabled');

    setInterval(function () {
      logger.flush();
    }, Config.get('logger:pino:extremeMode:tick', 10000)).unref();

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
    logger = pino(defaultOptions);
  }

  return logger;
};
