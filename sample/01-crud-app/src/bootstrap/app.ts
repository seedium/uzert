import { UzertFactory } from '@uzert/core';
import { Server } from '@uzert/server';
import { FastifyApp } from '@uzert/app';
import { AppModule } from '../app/AppModule';

async function bootstrap() {
  const app = await UzertFactory.create(AppModule, FastifyApp);

  await Server.run(app);
}

bootstrap();
