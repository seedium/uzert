export class AppAlreadyStartedError extends Error {
  constructor() {
    super('App already started. Please boot your "Server" provider it last');

    this.name = 'AppAlreadyStarted';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
