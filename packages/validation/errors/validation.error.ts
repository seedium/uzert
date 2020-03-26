import { ErrorObject } from 'ajv';

export class ValidationError extends Error {
  public validation: ErrorObject[] = [];

  constructor(message?: string, errors: ErrorObject[] = []) {
    super(message);

    this.name = 'ValidationError';
    this.validation = errors;

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
