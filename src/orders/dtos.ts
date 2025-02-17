import {Type} from 'class-transformer';
import {Min, MinLength} from 'class-validator';

export class CreateOrderDto {
  @MinLength(2)
  name: string;

  @Min(1)
  @Type(() => Number)
  pickupPointId: number;

  @Min(1, {each: true})
  @Type(() => Number)
  basketItemsIds: number[];
}

export class CancelOrderDto {
  @Min(1)
  @Type(() => Number)
  orderId: number;
}

export class PaymentDto {
  @Min(1)
  @Type(() => Number)
  orderId: number;
}
