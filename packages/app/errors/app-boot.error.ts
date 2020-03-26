import { AppInternalError } from './app-internal.error';
import Logger from '@uzert/logger';

export class AppBootError extends AppInternalError {
  constructor() {
    Logger.pino.error(`App not loaded. Please use "BootService" for app initialization`);

    super(`App not loaded`);

    this.name = 'AppBootError';

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppBootError.prototype);
  }
}
