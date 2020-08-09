import { Mongo } from '@uzert/mongo';
import { Config } from '@uzert/config';

export class Database extends Mongo {
  static for() {
    return {
      provide: Database,
      inject: [Config],
      useFactory: async (config: Config) => {
        const db = new Mongo({
          uri: config.get('database:uri'),
        });
        await db.connect();
        return db;
      },
    };
  }
}
