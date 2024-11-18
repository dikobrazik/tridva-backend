import {Module} from '@nestjs/common';
import {GroupsController} from './groups.controller';
import {GroupsService} from './groups.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Group} from 'src/entities/Group';
import {BasketItem} from 'src/entities/BasketItem';
import {BasketModule} from 'src/basket/basket.module';
import {Order} from 'src/entities/Order';

@Module({
  imports: [BasketModule, TypeOrmModule.forFeature([Order, Group, BasketItem])],
  controllers: [GroupsController],
  providers: [GroupsService],
  exports: [GroupsService],
})
export class GroupsModule {}
