export class AuthenticateUserMiddleware {
  public async handler(req) {
    req.context.user = {
      id: 'unique_example',
    };
  }
}
