import { join } from 'path';
import { Module } from '@uzert/core';
import { Config } from '@uzert/config';
import { Logger } from '@uzert/logger';

@Module({
  providers: [
    Config.boot({
      path: join(process.cwd(), 'src', 'config/**/*'),
    }),
    Logger.boot({
      pino: {
        enabled: true,
      },
    }),
  ],
  controllers: [],
  routes: [],
})
export class AppModule {

}
