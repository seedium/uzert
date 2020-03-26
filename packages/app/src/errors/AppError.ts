export default class AppError extends Error {
  constructor(message: string) {
    super(message);

    this.name = this.constructor.name;

    // output to console info about error
    console.error(this.stack);

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
