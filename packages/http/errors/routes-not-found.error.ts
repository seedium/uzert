export default class RoutesNotFoundError extends Error {
  constructor() {
    super('Folder with routes not found. Please create folder "routes" with file "web.ts" inside in your "src" folder');

    this.name = 'RoutesNotFoundError';

    // output to console info about error
    console.error(this.stack);

    // Capturing stack trace, excluding constructor call from it.
    Error.captureStackTrace(this, this.constructor);
  }
}
