import {Type} from 'class-transformer';
import {
  IsEmail,
  IsMobilePhone,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UserInfo {
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsMobilePhone('ru-RU')
  phone: string;
}

export class ProcessOrderDto {
  @ValidateNested()
  @Type(() => UserInfo)
  userInfo: UserInfo;

  @Min(1)
  @Type(() => Number)
  pickupPointId: number;

  @Min(1, {each: true})
  @Type(() => Number)
  basketItemsIds: number[];
}
