import {IsNotEmpty, MinLength} from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @MinLength(5)
  password: string;
}
