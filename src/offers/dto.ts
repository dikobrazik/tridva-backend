import {ApiPropertyOptional} from '@nestjs/swagger';
import {IsInt, IsOptional, Min} from 'class-validator';

export class SearchOffersDto {
  @ApiPropertyOptional()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({default: 1})
  @IsInt()
  @IsOptional()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({default: 20})
  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number;
}
