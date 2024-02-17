import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import {SEX} from 'src/shared/enums/sex';

export class UpdateProfileDto {
  @IsString()
  id: string;

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
