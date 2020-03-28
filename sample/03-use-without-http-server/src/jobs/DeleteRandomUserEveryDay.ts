import { bootstrap } from '../bootstrap/app';
import { UserService } from '../services/UserService';

export default async () => {
  const app = await bootstrap();

  const UserService = app.get<UserService>(UserService);

  UserService.deleteUser('test@gmail.com');

};
