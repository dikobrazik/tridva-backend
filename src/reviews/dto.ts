import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Max(5)
  @Min(1)
  @Type(() => Number)
  rating: number;
}

export class GetReviewsDto {
  @ApiPropertyOptional({default: 1})
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page: number;

  @ApiPropertyOptional({default: 20})
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  pageSize: number;

  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  offerId: number;
}

export class GetReviewsTotalDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  offerId: number;
}

export class CreateReviewParamsDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  offerId: number;
}
