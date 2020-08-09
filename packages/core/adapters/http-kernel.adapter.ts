export abstract class HttpKernelAdapter<Request, Response> {
  public abstract notFoundHandler(
    req: Request,
    res: Response,
  ): Promise<unknown> | unknown;
  public abstract errorHandler(
    err: Error,
    req: Request,
    res: Response,
  ): Promise<unknown> | unknown;
}
