import { AppInternalError } from './app-internal.error';

export class AppBootError extends AppInternalError {
  constructor() {
    super(`App not loaded`);

    this.name = 'AppBootError';

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppBootError.prototype);
  }
}
