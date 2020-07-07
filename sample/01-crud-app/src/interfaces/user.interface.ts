export interface UserDto {
  firstName: string;
  lastName: string;
  email: string;
}

export interface User extends UserDto {
  _id: string;
}
