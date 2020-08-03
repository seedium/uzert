import { RouteModule, Injectable } from '@uzert/core';
import { Router } from '@uzert/fastify';
import { FooController } from '../controllers/foo.controller';

@Injectable()
export class MainRoute implements RouteModule {
  options = {
    prefix: '/api',
  };
  constructor(private readonly fooController: FooController) {}
  public register() {
    return (router: Router) => {
      router.get('/custom-service', this.fooController.test);
    };
  }
}
