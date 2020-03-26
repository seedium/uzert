import { Db, MongoClient } from 'mongodb';
// core
import Config from '@uzert/config';
import Logger from '@uzert/logger';
// types
import { IProvider } from '@uzert/core';
// errors
import ClientNotBootedError from './errors/ClientNotBootedError';
import MissedParamsError from './errors/MissedParamsError';

class Client implements IProvider {
  public _client: MongoClient | undefined;
  public _db: Db | undefined;

  get client(): MongoClient {
    if (!this._client) {
      throw new ClientNotBootedError();
    }

    return this._client;
  }

  get db(): Db | undefined {
    if (!this._db) {
      throw new ClientNotBootedError();
    }

    return this._db;
  }

  public async boot() {
    const startTime = new Date().getTime();
    const databaseConnection = Config.get('database:connection');
    const databaseName = Config.get('database:name');
    const databaseOptions = Config.get('database:options');
    const connectionString = `${databaseConnection}/${databaseName}${databaseOptions || ''}`;

    if (!databaseConnection) {
      throw new MissedParamsError(['database:connection']);
    }

    if (!databaseName) {
      throw new MissedParamsError(['database:name']);
    }

    try {
      // TODO implement reconnect if connection is loosed
      this._client = await MongoClient.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this._db = this._client.db(Config.get('database:name'));

      const finishTime = new Date().getTime();
      Logger.pino.info(`MongoDB connection is set in ${finishTime - startTime}ms to  ${connectionString}`);
    } catch (e) {
      Logger.pino.error(new Error(`Can't set connection to ${connectionString}`));
      throw e;
    }
  }

  public async unBoot() {
    if (this._client) {
      await this._client.close();
    }

    this._client = undefined;
    this._db = undefined;
  }
}

export default new Client();
