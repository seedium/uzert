import { Config } from '@uzert/config';
import * as fp from 'fastify-plugin';

@Injectable()
export class GlobalRouter {
  constructor(
    private readonly _config: Config,
  ) {}
  public register() {
    return fp((app, options, done) => {
      const routeConfig = this._config.get('route');
      app.get('/healthz', async (req, res) => res.send({ test: routeConfig }));
      done();
    })
  };
};
