import { UzertFactory } from '@uzert/core';
import { ServiceApplicationAdapter } from '../app/adapters/service-application.adapter';
import { AppModule } from '../app/app-module';

const start = async () => {
  const app = await UzertFactory.create(AppModule, ServiceApplicationAdapter.boot());
};
start();
