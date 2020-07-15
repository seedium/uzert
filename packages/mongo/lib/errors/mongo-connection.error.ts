export class MongoConnectionError extends Error {
  public name = 'MongoConnectionError';
  constructor(reconnectTries: number) {
    super(`Could not to connect to mongo after ${reconnectTries} tries`);
  }
}
