import {Type} from 'class-transformer';
import {IsEnum, IsNotEmpty, Min, MinLength} from 'class-validator';
import {OrderStatus} from 'src/entities/enums';

export class LoginDto {
  @IsNotEmpty()
  @MinLength(3)
  username: string;

  @IsNotEmpty()
  @MinLength(5)
  password: string;
}

export class OrderDto {
  @IsNotEmpty()
  @Min(1)
  @Type(() => Number)
  id: number;

  @IsEnum(OrderStatus)
  status: OrderStatus;
}
