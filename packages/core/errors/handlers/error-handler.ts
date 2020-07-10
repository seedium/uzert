export class ErrorHandler {
  private static readonly logger = console;

  public handle(err: Error) {
    ErrorHandler.logger.error(err.message, err.stack);
  }
}
