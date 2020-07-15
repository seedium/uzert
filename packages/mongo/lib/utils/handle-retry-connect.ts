import { MongoClient } from 'mongodb';
import { promisify } from 'util';
import { MongoRetryOptions } from '../interfaces';
import { MongoConnectionError } from '../errors';

const delay = promisify(setTimeout);

export const handleRetryConnect = async (
  createConnectionFactory: () => Promise<MongoClient>,
  {
    reconnectTries = 30,
    reconnectInterval = 1000,
  }: MongoRetryOptions = {},
  currentRetryNumber = 0,
): Promise<MongoClient> => {
  try {
    return await createConnectionFactory();
  } catch (e) {
    if (currentRetryNumber >= reconnectTries) {
      throw new MongoConnectionError(currentRetryNumber);
    }
    await delay(reconnectInterval);
    return await handleRetryConnect(createConnectionFactory, { reconnectTries, reconnectInterval }, currentRetryNumber + 1)
  }
};
