import {ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsOptional, Min, IsInt} from 'class-validator';
import {Paginable} from 'src/shared/dto/pagination';

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
