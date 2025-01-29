import {ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsOptional, Min, IsInt, IsEnum} from 'class-validator';
import {Paginable} from 'src/shared/dto/pagination';
import {SORT} from './constants';

export class SearchOffersDto extends Paginable {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  priceFrom?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  priceTo?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(SORT)
  order?: Values<typeof SORT>;
}

export class OffersTotalDto {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  category?: string;
}

export class SearchOfferDto {
  @Min(1)
  @Type(() => Number)
  id: number;
}

export class ToggleOfferFavoriteDto extends SearchOfferDto {}
