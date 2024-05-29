import {ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsOptional, Min, IsInt} from 'class-validator';
import {Paginable} from 'src/shared/dto/pagination';

export class SearchOffersDto extends Paginable {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  category?: string;
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
