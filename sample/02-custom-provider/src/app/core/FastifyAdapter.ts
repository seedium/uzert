import { FactoryProvider } from '@uzert/core';
import { FastifyAdapter as FastifyAdapterBase } from '@uzert/fastify';
import { Logger } from '@uzert//logger';

export class FastifyAdapter extends FastifyAdapterBase {
  static boot(): FactoryProvider {
    return {
      provide: FastifyAdapter,
      inject: [Logger],
      useFactory: (logger: Logger) => {
        return new FastifyAdapter(undefined, logger.pino);
      },
    };
  }
}
