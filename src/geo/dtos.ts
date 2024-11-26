import {Type} from 'class-transformer';
import {Min} from 'class-validator';

export class GetCityPickupPointsParamsDto {
  @Type(() => Number)
  @Min(0)
  id: number;
}

export class GetPickupPointParamsDto {
  @Type(() => Number)
  @Min(0)
  id: number;
}
