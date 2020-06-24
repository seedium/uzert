import { UzertFactory } from '@uzert/core';
import { FastifyAdapter } from '@uzert/fastify';
import { AppModule } from '../app/app-module';

async function start() {
  const app = await UzertFactory.create(AppModule, new FastifyAdapter());
  await app.listen();
}
start();
