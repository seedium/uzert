export default class SchemaError extends Error {
  constructor(message: string) {
    super(message);

    this.name = 'SchemaError';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
