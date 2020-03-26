import Logger from '@uzert/logger';
import { AppInternalError } from './app-internal.error';

export class AppAlreadyStartedError extends AppInternalError {
  constructor() {
    Logger.pino.error(`App already started. Please change your method invokes`);

    super(`App already started`);

    this.name = 'AppAlreadyStarted';

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppAlreadyStartedError.prototype);
  }
}
