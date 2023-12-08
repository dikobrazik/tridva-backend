import {IsNotEmpty, MinLength} from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
