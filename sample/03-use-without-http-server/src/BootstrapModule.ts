import { Module } from '@uzert/core';
import { Config } from '@uzert/config';
import { Logger } from '@uzert/logger';

@Module({
  providers: [
    Config.boot(),
    Logger.boot(),
  ]
})
export class BootstrapModule {

}
