import { Module } from '@uzert/core';
import { Config } from '@uzert/config';
import { Logger } from '@uzert/logger';

@Module({
  providers: [
    Config.for(),
    Logger.for(),
  ]
})
export class BootstrapModule {

}
