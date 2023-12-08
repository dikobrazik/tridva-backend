import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsNotEmpty, MinLength} from 'class-validator';

export class UserDto {
  @ApiPropertyOptional({minLength: 3})
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @ApiPropertyOptional({minLength: 8})
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
