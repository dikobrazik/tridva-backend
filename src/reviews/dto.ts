import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsInt, IsNotEmpty, MinLength} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(10)
  text: string;

  @ApiProperty()
  @IsNotEmpty()
  offerId: number;
}

export class GetReviewsDto {
  @ApiProperty()
  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  offerId: number;
}
