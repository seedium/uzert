import { NestFactory } from '@uzert/core';
import { BootstrapModule } from '../BootstrapModule';

export const bootstrap = async () => {
  const app = NestFactory.createApplicationContext(BootstrapModule);

  return app;
};
