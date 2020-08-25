import { MongoClient } from 'mongodb';
import { DynamicModule, FactoryProvider, Inject, Module, OnAppShutdown } from '@uzert/core';
import { MongoConnection } from './mongo.constants';
import { handleRetryConnect } from './utils';
import { createConnection } from './factories';
import { MongoOptions } from './interfaces';

@Module({})
export class MongoModule implements OnAppShutdown {
  static for(uri: string, options?: MongoOptions): DynamicModule {
    const { reconnectTries, reconnectInterval, ...mongoOptions } = options;
    const connectionProvider: FactoryProvider<MongoClient> = {
      provide: MongoConnection,
      useFactory: async () => {
        return await handleRetryConnect(
          async () => createConnection(uri, mongoOptions),
          { reconnectTries, reconnectInterval },
        );
      },
    };
    return {
      module: MongoModule,
      providers: [connectionProvider],
      exports: [connectionProvider],
    }
  }
  constructor(@Inject(MongoConnection) private readonly connection: MongoClient) {}
  public async onAppShutdown(): Promise<void> {
    this.connection && await this.connection.close();
  }
}
