import { ErrorHandler } from './error-handler';

const DEFAULT_TEARDOWN = () => process.exit(1);

export class ErrorsZone {
  private static readonly errorHandler = new ErrorHandler();

  public static run(
    callback: () => void,
    teardown: (err: any) => void = DEFAULT_TEARDOWN,
  ) {
    try {
      callback();
    } catch (e) {
      this.errorHandler.handle(e);
      teardown(e);
    }
  }

  public static async asyncRun(
    callback: () => Promise<void>,
    teardown: (err: any) => void = DEFAULT_TEARDOWN,
  ) {
    try {
      await callback();
    } catch (e) {
      this.errorHandler.handle(e);
      teardown(e);
    }
  }
}
