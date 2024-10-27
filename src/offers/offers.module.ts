import {Module} from '@nestjs/common';
import {OffersController} from './offers.controller';
import {OffersService} from './offers.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Offer} from 'src/entities/Offer';
import {Category} from 'src/entities/Category';
import {CategoryService} from 'src/category/category.service';
import {GroupsService} from 'src/groups/groups.service';
import {Group} from 'src/entities/Group';
import {BasketItem} from 'src/entities/BasketItem';
import {AttributesModule} from 'src/attributes/attributes.module';
import {FavoriteOffer} from 'src/entities/FavoriteOffer';
import {JwtModule} from '@nestjs/jwt';
import {User} from 'src/entities/User';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Category,
      Group,
      BasketItem,
      FavoriteOffer,
      User,
    ]),
    AttributesModule,
    JwtModule,
  ],
  controllers: [OffersController],
  providers: [OffersService, CategoryService, GroupsService],
  exports: [OffersService],
})
export class OffersModule {}
