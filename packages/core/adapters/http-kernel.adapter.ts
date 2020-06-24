import { IncomingMessage, ServerResponse } from 'http';

export abstract class HttpKernelAdapter<Request = IncomingMessage, Response = ServerResponse> {
  public abstract validateRequest(req: Request, res: Response): Promise<void> | void;

  public abstract validateResponse<Payload = any>(
    req: Request,
    res: Response,
    payload?: Payload,
  ): Promise<Payload> | Payload;

  public abstract notFoundHandler(req: Request, res: Response): Promise<any> | any;

  public abstract errorHandler(err: Error, req: Request, res: Response): Promise<any> | any;
}
