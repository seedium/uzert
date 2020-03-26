export default class UnknownModelNameError extends Error {
  constructor() {
    super(
      'Model name is unknown. Please check that your have created an instance of passed model',
    );

    this.name = 'UnknownModelName';

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
