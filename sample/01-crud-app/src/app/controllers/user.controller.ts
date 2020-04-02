import { IUser } from '../../interfaces/user.interface';

export class UserController {
  public async create(req): Promise<IUser> {
    await this.userService.create(req.body);
  }

  public async retrieve(req): Promise<IUser> {
    await this.userService.retrieve(req.params.idUser);
  }

  public async update(req): Promise<IUser> {
    await this.userService.update(req.params.idUser, req.body);
  }

  public async delete(req): Promise<void> {
    await this.userService.delete(req.params.idUser);
  }

  public async list(req): Promise<IUser[]> {
    await this.userService.list(req.query);
  }

}
