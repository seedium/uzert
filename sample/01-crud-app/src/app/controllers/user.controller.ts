import { User, UserDto } from '../../interfaces';
import { UserService } from '../services';
import { CheckPaidPlanMiddleware, CheckPermissionsMiddleware, AuthenticateUserMiddleware } from '../middlewares';

export class UserController {
  constructor(private readonly userService: UserService) {}
  public create = async (req: Request<UserDto>): Promise<User> => {
    return await this.userService.create(req.body);
  }

  public retrieve = async (req): Promise<User> => {
    return await this.userService.retrieve(req.params.idUser);
  }

  @UsePipe(CheckPaidPlanMiddleware)
  public update = async (req): Promise<User> => {
    return await this.userService.update(req.params.idUser, req.body);
  }

  @UsePipe(AuthenticateUserMiddleware)
  @UsePipe(CheckPermissionsMiddleware.use(['user:delete'], ['user']))
  public delete = async (req): Promise<void> => {
    return await this.userService.delete(req.params.idUser);
  }

  public list = async (req): Promise<User[]> => {
    return await this.userService.list(req.query);
  }

}
