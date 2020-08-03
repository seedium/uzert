import { Module } from '@uzert/core';
import { Logger } from '@uzert/logger';
import { CustomService } from './services/custom.service';
import { FooController } from './controllers/foo.controller';
import { MainRoute } from './routes/main.route';

@Module({
  providers: [
    CustomService.boot({
      bool: true,
      foo: 'bar',
    }),
    Logger.boot({
      default: {
        enabled: false,
      },
      pino: {
        enabled: true,
      },
    }),
  ],
  controllers: [FooController],
  routes: [MainRoute],
})
export class AppModule {}
