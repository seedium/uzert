import { IncomingMessage, ServerResponse } from 'http';

export abstract class HttpKernelAdapter<Request = IncomingMessage, Response = ServerResponse> {
  public abstract middlewares: string[] = [];

  public async validateRequest() {}

  public async validateResponse() {}

  public async notFoundHandler(req: Request, res: Response) {
    return {
      message: 'Route not found',
    };
  }

  public async errorHandler(err: Error, req: Request, res: Response) {
    // TODO inject logger
    // Logger.pino.error(err);

    return {
      message: err.message,
    };
  }
}
