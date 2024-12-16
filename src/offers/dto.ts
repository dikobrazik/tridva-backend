import {ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsOptional, Min, IsInt, IsEnum} from 'class-validator';
import {Paginable} from 'src/shared/dto/pagination';
import {ORDER} from './constants';

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
  @IsEnum(ORDER)
  order?: Values<typeof ORDER>;
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
