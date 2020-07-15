import { MongoClientOptions } from 'mongodb';
import { MongoRetryOptionsInterface } from './mongo-retry.options';

export interface MongoOptions extends MongoClientOptions, MongoRetryOptionsInterface {}
