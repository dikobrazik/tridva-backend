import {Type} from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsOptional,
} from 'class-validator';
import {SEX} from 'src/shared/enums/sex';

export class UpdateProfileDto {
  @IsInt()
  @Type(() => Number)
  id: number;

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
