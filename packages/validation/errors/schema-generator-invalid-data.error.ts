export class SchemasGeneratorInvalidDataError extends Error {
  constructor() {
    super('Invalid Data');

    this.name = 'InvalidSchemasGeneratorData';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
