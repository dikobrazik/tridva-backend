import {applyDecorators} from '@nestjs/common';
import {Type} from 'class-transformer';
import {IsInt, IsNotEmpty, Min} from 'class-validator';

export const OfferId = () => {
  return applyDecorators(
    IsInt(),
    Min(1),
    IsNotEmpty(),
    Type(() => Number),
  );
};
