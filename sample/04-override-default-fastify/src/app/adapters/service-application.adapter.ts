import { FastifyAdapter } from '@uzert/fastify';

export class ServiceApplicationAdapter extends FastifyAdapter {
  static boot() {
    return {
      provide: ServiceApplicationAdapter,
      inject: [Config, Logger],
      useFactory: (config: Config, logger: Logger) => {
        const serverOptions = config.get('server');
        return new FastifyAdapter(logger, serverOptions);
      }
    }
  }
}
