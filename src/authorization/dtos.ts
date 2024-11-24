import {Type} from 'class-transformer';
import {IsInt, IsMobilePhone, Max, Min} from 'class-validator';

export class GetCodeDto {
  @IsMobilePhone('ru-RU')
  phone: string;
}

export class CheckCodeDto {
  @IsMobilePhone('ru-RU')
  phone: string;

  @Max(999999)
  @Min(100000)
  @IsInt()
  @Type(() => Number)
  code: string;
}
