import AppInternalError from './AppError';
import Logger from '@uzert/logger';

export default class AppAlreadyStartedError extends AppInternalError {
  constructor() {
    Logger.pino.error(`App already started. Please change your method invokes`);

    super(`App already started`);

    this.name = 'AppAlreadyStarted';

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppAlreadyStartedError.prototype);
  }
}
