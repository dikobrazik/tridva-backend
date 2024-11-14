import {Module} from '@nestjs/common';
import {PullerService} from './puller.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Category} from 'src/entities/Category';
import {ConfigModule} from '@nestjs/config';
import {Offer} from 'src/entities/Offer';
import {Attribute} from 'src/entities/Attribute';
import {OfferAttribute} from 'src/entities/OfferAttribute';
import {PullHistory} from 'src/entities/PullHistory';
import {OfferPhoto} from 'src/entities/OfferPhoto';
import {OffersModule} from 'src/offers/offers.module';
import {CategoryModule} from 'src/category/category.module';
import {Modifier} from 'src/entities/Modifier';
import {OfferModifier} from 'src/entities/OfferModifier';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attribute,
      Category,
      Offer,
      OfferPhoto,
      OfferAttribute,
      Modifier,
      OfferModifier,
      PullHistory,
    ]),
    ConfigModule,
    OffersModule,
    CategoryModule,
  ],
  providers: [PullerService],
})
export class PullerModule {}
