import {Module} from '@nestjs/common';
import {GroupsController} from './groups.controller';
import {GroupsService} from './groups.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Group} from 'src/entities/Group';
import {BasketItem} from 'src/entities/BasketItem';
import {BasketModule} from 'src/basket/basket.module';
import {Order} from 'src/entities/Order';
import {OrderOffer} from 'src/entities/OrderOffer';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrdersModule} from 'src/orders/orders.module';

@Module({
  imports: [
    BasketModule,
    OrdersModule,
    TypeOrmModule.forFeature([
      Order,
      OrderOffer,
      OrderGroup,
      Group,
      BasketItem,
    ]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
