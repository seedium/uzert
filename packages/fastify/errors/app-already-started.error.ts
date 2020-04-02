import { AppInternalError } from './app-internal.error';

export class AppAlreadyStartedError extends AppInternalError {
  constructor() {
    super(`App already started`);

    this.name = 'AppAlreadyStarted';

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppAlreadyStartedError.prototype);
  }
}
