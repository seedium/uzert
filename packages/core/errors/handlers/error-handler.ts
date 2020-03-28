export class ErrorHandler {
  /* TODO use logger from @uzert/logger package */
  private static readonly logger = console;

  public handle(err: Error) {
    ErrorHandler.logger.error(err.message, err.stack);
  }
}
