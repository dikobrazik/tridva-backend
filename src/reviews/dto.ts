import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsInt, IsNotEmpty, IsString, Max, Min} from 'class-validator';
import {OfferId} from 'src/shared/dto/decorators';
import {Paginable} from 'src/shared/dto/pagination';

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

export class GetReviewsDto extends Paginable {
  @ApiProperty()
  @OfferId()
  offerId: number;
}

export class GetHasReviewDto {
  @ApiProperty()
  @OfferId()
  offerId: number;
}

export class GetReviewsTotalDto {
  @ApiProperty()
  @OfferId()
  offerId: number;
}

export class CreateReviewParamsDto {
  @ApiProperty()
  @OfferId()
  offerId: number;
}
