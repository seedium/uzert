import Logger from '@uzert/logger';

export class ServerNotBootedError extends Error {
  constructor() {
    Logger.pino.error(new Error(`Server not booted. Please use "BootService" for server initialization`));

    super(`Server not booted`);

    this.name = 'ServerNotBootedError';

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, ServerNotBootedError.prototype);
  }
}
