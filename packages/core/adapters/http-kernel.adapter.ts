export abstract class HttpKernelAdapter<Request, Response> {
  public abstract notFoundHandler(req: Request, res: Response): Promise<any> | any;
  public abstract errorHandler(err: Error, req: Request, res: Response): Promise<any> | any;
}
