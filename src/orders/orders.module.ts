import {Module} from '@nestjs/common';
import {OrdersController} from './orders.controller';
import {OrdersService} from './orders.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Order} from 'src/entities/Order';
import {BasketItem} from 'src/entities/BasketItem';
import {GeoModule} from 'src/geo/geo.module';

@Module({
  imports: [GeoModule, TypeOrmModule.forFeature([Order, BasketItem])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
