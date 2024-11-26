import {Module} from '@nestjs/common';
import {OrdersController} from './orders.controller';
import {OrdersService} from './orders.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Order} from 'src/entities/Order';
import {BasketItem} from 'src/entities/BasketItem';
import {GeoModule} from 'src/geo/geo.module';
import {KassaModule} from 'src/kassa/kassa.module';
import {OrderOffer} from 'src/entities/OrderOffer';
import {OrderGroup} from 'src/entities/OrderGroup';
import {Payment} from 'src/entities/Payment';

@Module({
  imports: [
    GeoModule,
    KassaModule,
    TypeOrmModule.forFeature([
      Order,
      OrderOffer,
      OrderGroup,
      BasketItem,
      Payment,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
