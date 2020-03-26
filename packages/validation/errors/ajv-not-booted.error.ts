export default class AjvNotBootedError extends Error {
  constructor() {
    super('Ajv not booted. Please use your "BootService" for using validation');

    this.name = 'AjvNotBooted';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
