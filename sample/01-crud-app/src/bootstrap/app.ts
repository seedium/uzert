import { UzertFactory } from '@uzert/core';
import { Server } from '@uzert/server';
import { AppModule } from '../app/AppModule';
import { FastifyApp } from '@uzert/app';

async function bootstrap() {
  const app = await UzertFactory.create(AppModule, FastifyApp);

  await Server.run(app);
}

bootstrap();
