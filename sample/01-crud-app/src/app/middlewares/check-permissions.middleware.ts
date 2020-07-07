export class CheckPermissionsMiddleware {
  static use(permissions: string[], roles: string[]) {
    return {
      provide: CheckPermissionsMiddleware,
      useFactory: () => {
        return new CheckPermissionsMiddleware(permissions, roles);
      },
    };
  }
  constructor(
    private readonly _permissions: string[] = [],
    private readonly _roles: string[] = [],
  ) {}
  public async handle(req) {
    const user = req.context.user;
    if (!user) {
      throw new Error('User does not exists');
    }
    if (!this._roles.includes(user.role)) {
      throw new Error(`Role ${user.roles.join(', ')} doesn't satisfied required roles ${this._roles.join(', ')}`);
    }
    if (!this._permissions.includes(user.permission)) {
      throw new Error('Permission required');
    }
  }
}
