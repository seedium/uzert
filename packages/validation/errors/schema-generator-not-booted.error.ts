export class SchemasGeneratorNotBootedError extends Error {
  constructor() {
    super('SchemasGenerator not booted. Please use your "BootService" for using validation');

    this.name = 'SchemasGeneratorNotBooted';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
