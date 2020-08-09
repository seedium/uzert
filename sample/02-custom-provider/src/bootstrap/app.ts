import { UzertFactory } from '@uzert/core';
import { FastifyAdapter } from '../app/core/FastifyAdapter';
import { AppModule } from '../app/app-module';

const bootstrap = async () => {
  const app = await UzertFactory.create(AppModule, FastifyAdapter.for());
  await app.listen();
}
bootstrap();
