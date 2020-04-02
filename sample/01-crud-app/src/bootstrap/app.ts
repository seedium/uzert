import { UzertFactory } from '@uzert/core';
import { FastifyApp } from '@uzert/app';
import { AppModule } from '../app/app-module';

async function start() {
  const app = await UzertFactory.create(AppModule, FastifyApp);

  await app.listen();
}

start();
