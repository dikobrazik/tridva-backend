import {Type} from 'class-transformer';
import {IsInt} from 'class-validator';

export class FindOneParams {
  @IsInt()
  @Type(() => Number)
  id: number;
}
