import { Injectable } from '@uzert/core';
import { Logger } from '@uzert/logger';
import { IUser } from '../interfaces/User.interface';

@Injectable()
export class UserService {
  private _users: IUser[] = [];

  constructor(private readonly logger: Logger) {
  }

  public createUser(user: IUser): IUser {
    this.logger.pino.trace(`Trying to create user`);
    this._users.push(user);
    this.logger.pino.info(`User is successfully created`);

    return user;
  }

  public deleteUser(email: string): boolean {
    this.logger.pino.trace(`Trying to delete user`);
    const userToDeleteIndex = this._users.findIndex((user) => user.email === email);

    if (userToDeleteIndex === -1) {
      this.logger.pino.error(`User not found`);
      return false;
    }

    this.logger.pino.info(`User found in "${userToDeleteIndex}" index`);
    this._users.splice(userToDeleteIndex, 1);
    this.logger.pino.info(`User successfully deleted`);

    return true;
  }

}
