import { UserController } from '../app/controllers';
import { Config } from '@uzert/config';
import { Router } from '@uzert/fastify';

@Injectable()
export class UserRouter {
  public options = {
    prefix: '/users',
  }
  constructor(
    private readonly _config: Config,
    private readonly _userControllers: UserController,
    private readonly _pipe:
  ) {}
  public register() {
    return (router: Router, app) => {

      router.post('/', this._userControllers.create);
      router.get('/', this._userControllers.list);
      router.get('/:idUser', this._userControllers.retrieve);
      router.put('/:idUser', this._userControllers.update);
      router.delete('/:idUser', this._userControllers.delete);
    }
  }
}
