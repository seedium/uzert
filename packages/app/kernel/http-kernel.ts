import { Request, Response, IPluginKernel, IHttpKernel } from '@uzert/app';
import Logger from '@uzert/logger';

export abstract class HttpKernel implements IHttpKernel {
  public abstract plugins: IPluginKernel[] = [];
  public abstract middlewares: string[] = [];

  public async notFoundHandler(req: Request, res: Response) {
    res.status(404);

    return;
  }

  public async errorHandler(err: Error, req: Request, res: Response) {
    Logger.pino.error(err);

    return {
      message: err.message,
    };
  }
}
