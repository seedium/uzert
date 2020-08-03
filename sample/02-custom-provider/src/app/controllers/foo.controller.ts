import { Injectable } from '@uzert/core';
import { Controller } from '@uzert/fastify';
import { CustomService } from '../services/custom.service';

@Injectable()
export class FooController {
  constructor(private readonly customService: CustomService) {}
  @Controller()
  public async test() {
    return this.customService.options;
  }
}
