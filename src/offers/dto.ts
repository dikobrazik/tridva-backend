import {ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsOptional, Min, IsInt} from 'class-validator';

export class SearchOffersDto {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({default: 1})
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({default: 20})
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize?: number;
}
