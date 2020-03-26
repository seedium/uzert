export class ClientNotBootedError extends Error {
  constructor() {
    super('Client not booted yet. Please add mongo client to your "BootService"');

    // output to console info about error
    console.error(this.stack);

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
