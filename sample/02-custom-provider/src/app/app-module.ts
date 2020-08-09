import { Module } from '@uzert/core';
import { Logger } from '@uzert/logger';
import { CustomService } from './services/custom.service';
import { FooController } from './controllers/foo.controller';
import { MainRoute } from './routes/main.route';

@Module({
  providers: [
    CustomService.for({
      bool: true,
      foo: 'bar',
    }),
    Logger.for({
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
