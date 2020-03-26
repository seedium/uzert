export class SchemaNotFoundError extends Error {
  constructor(schema: string) {
    super(`Schema "${schema}" not found`);

    this.name = 'SchemaNotFoundError';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
