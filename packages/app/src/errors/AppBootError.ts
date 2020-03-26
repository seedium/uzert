import AppError from './AppError';
import Logger from '@uzert/logger';

export default class AppBootError extends AppError {
  constructor() {
    Logger.pino.error(`App not loaded. Please use "BootService" for app initialization`);

    super(`App not loaded`);

    this.name = 'AppBootError';

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppBootError.prototype);
  }
}
