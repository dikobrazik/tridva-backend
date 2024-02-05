import {ApiProperty} from '@nestjs/swagger';
import {Type} from 'class-transformer';
import {IsInt, Min} from 'class-validator';

export class GetGroupsDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  offerId: number;
}

export class GetGroupsTotalDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  offerId: number;
}

export class CreateGroupOrderDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  offerId: number;
}

export class JoinGroupOrderDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  groupId: number;
}
