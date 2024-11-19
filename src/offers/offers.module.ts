import {Module} from '@nestjs/common';
import {OffersController} from './offers.controller';
import {OffersService} from './offers.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Offer} from 'src/entities/Offer';
import {Category} from 'src/entities/Category';
import {Group} from 'src/entities/Group';
import {BasketItem} from 'src/entities/BasketItem';
import {AttributesModule} from 'src/attributes/attributes.module';
import {FavoriteOffer} from 'src/entities/FavoriteOffer';
import {FavoriteOffersService} from './favoriteOffers.service';
import {GroupsModule} from 'src/groups/groups.module';
import {CategoryModule} from 'src/category/category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Offer,
      Category,
      Group,
      BasketItem,
      FavoriteOffer,
    ]),
    AttributesModule,
    GroupsModule,
    CategoryModule,
  ],
  controllers: [OffersController],
  providers: [OffersService, FavoriteOffersService],
  exports: [OffersService, FavoriteOffersService],
})
export class OffersModule {}
