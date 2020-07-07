import { join } from 'path';
import { Module } from '@uzert/core';
import { Config } from '@uzert/config';
import { Logger } from '@uzert/logger';
import { ModelBootstrap } from '@uzert/mongo';
import { RouteProvider } from './Providers/RouteProvider';
import { Database } from './providers/database.provider';

@Module({
  providers: [
    Config.boot({
      path: join(process.cwd(), 'src', 'config/**/*'),
    }),
    Logger.boot({
      pino: {
        enabled: true,
      },
      slack: {
        enabled: false,
      }
    }),
    Database.boot(),
    ModelBootstrap.boot({
      path: join(process.cwd(), 'src', 'app', 'models/**/*'),
    }),
    RouteProvider.boot(),
  ],
  controllers: [],
  routes: [],
})
export class AppModule {

}
