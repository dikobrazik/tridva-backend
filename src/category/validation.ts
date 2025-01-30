import {Type} from 'class-transformer';
import {IsOptional, Max, Min, MinLength} from 'class-validator';

export class CategoriesListQuery {
  @Max(10)
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  level: number;

  @Min(1)
  @IsOptional()
  @Type(() => Number)
  parentId: number;

  @MinLength(1)
  @IsOptional()
  name: string;
}
