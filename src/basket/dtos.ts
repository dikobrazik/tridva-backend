import {Type} from 'class-transformer';
import {Max, Min} from 'class-validator';

export class PutGroupToBasketBody {
  @Min(1)
  @Type(() => Number)
  groupId: number;
}

export class GetBasketItemByOfferIdPayload {
  @Min(1)
  @Type(() => Number)
  offerId: number;
}

export class PutOfferToBasketBody {
  @Min(1)
  @Type(() => Number)
  offerId: number;
}

export class ChangeBasketItemCountBody {
  @Min(0)
  @Max(100)
  @Type(() => Number)
  count: number;
}

export class OfferCountParams {
  @Min(1)
  @Type(() => Number)
  offerId: number;
}

export class BasketItemParams {
  @Min(1)
  @Type(() => Number)
  id: number;
}
