import {IsDateString, IsEmail, IsEnum, IsOptional} from 'class-validator';
import {SEX} from 'src/shared/enums/sex';

export class UpdateProfileDto {
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @IsOptional()
  @IsEnum(SEX)
  sex?: string;
}
