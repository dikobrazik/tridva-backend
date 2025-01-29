import {Type} from 'class-transformer';
import {IsOptional, Max, Min, MinLength} from 'class-validator';

export class CategoriesListQuery {
  @Type(() => Number)
  @Max(10)
  @Min(1)
  @IsOptional()
  level: number;

  @Type(() => Number)
  @Max(10)
  @Min(1)
  @IsOptional()
  parentId: number;

  @MinLength(1)
  @IsOptional()
  name: string;
}
