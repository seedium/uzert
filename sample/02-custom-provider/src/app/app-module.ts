import { Module } from '@uzert/core';
import { LoggerModule } from '@uzert/logger';
import { CustomService } from './services/custom.service';
import { FooController } from './controllers/foo.controller';
import { MainRoute } from './routes/main.route';

@Module({
  providers: [
    CustomService.for({
      bool: true,
      foo: 'bar',
    }),
  ],
  imports: [
    LoggerModule.for({
      pino: {
        enabled: true,
      },
    }),
  ],
  controllers: [FooController],
  routes: [MainRoute],
})
export class AppModule {}
