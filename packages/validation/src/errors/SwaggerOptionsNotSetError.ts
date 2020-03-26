export default class SwaggerOptionsNotSetError extends Error {
  constructor() {
    super('Swagger options not set');

    this.name = 'SwaggerOptionsNotSet';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
