import { MongoClient, MongoClientOptions } from 'mongodb';

export const createConnection = async (uri: string, options?: MongoClientOptions): Promise<MongoClient> => {
  return await MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ...options,
  });
};
