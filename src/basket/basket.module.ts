import {Module} from '@nestjs/common';
import {BasketService} from './basket.service';
import {BasketController} from './basket.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {Group} from 'src/entities/Group';

@Module({
  imports: [TypeOrmModule.forFeature([BasketItem, Group])],
  providers: [BasketService],
  controllers: [BasketController],
  exports: [BasketService],
})
export class BasketModule {}
