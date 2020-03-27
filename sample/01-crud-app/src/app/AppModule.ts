import { Module } from '@uzert/core';
import { Config } from '@uzert/config';
import { Logger } from '@uzert/logger';
import { Database, ModelBootstrap } from '@uzert/mongo';
import { RouteProvider } from './Providers/RouteProvider';

@Module({
  providers: [
    Config.boot({
      path: 'config/**/*',
    }),
    Logger.boot({
      pino: {
        enabled: true,
      },
      slack: {
        enabled: false,
      }
    }),
    Database.boot({
      mongoUrl: 'mongodb://localhost:27017'
    }),
    ModelBootstrap.boot({
      path: 'app/Models/**/*',
    }),
    RouteProvider.boot(),
  ],
  services: [],
})
export class AppModule {

}
