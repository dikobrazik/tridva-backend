import {Type} from 'class-transformer';
import {Min} from 'class-validator';

export class PutItemToBasketBody {
  @Min(1)
  @Type(() => Number)
  groupId: number;
}

export class RemoveItemFromBasketBody {
  @Min(1)
  @Type(() => Number)
  id: number;
}
