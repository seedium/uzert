import { FactoryProvider } from '@uzert/core';
import { FastifyAdapter as FastifyAdapterBase } from '@uzert/fastify';
import { PinoLogger } from '@uzert//logger';

export class FastifyAdapter extends FastifyAdapterBase {
  static for(): FactoryProvider<FastifyAdapter> {
    return {
      provide: FastifyAdapter,
      inject: [PinoLogger],
      useFactory: (logger: PinoLogger): FastifyAdapter => {
        return new FastifyAdapter(undefined, logger);
      },
    };
  }
}
