import {IsNumber, IsOptional} from 'class-validator';

export class SearchOffersDto {
  search?: string;

  @IsNumber()
  @IsOptional()
  page?: number;

  @IsNumber()
  @IsOptional()
  pageSize?: number;
}
