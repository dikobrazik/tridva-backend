import {Type} from 'class-transformer';
import {Max, Min} from 'class-validator';

export class PutGroupToBasketBody {
  @Min(1)
  @Type(() => Number)
  groupId: number;
}

export class PutOfferToBasketBody {
  @Min(1)
  @Type(() => Number)
  offerId: number;
}

export class ChangeBasketItemCountBody {
  @Min(1)
  @Max(100)
  @Type(() => Number)
  count: number;
}

export class BasketItemParams {
  @Min(1)
  @Type(() => Number)
  id: number;
}
