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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attribute,
      Category,
      Offer,
      OfferPhoto,
      OfferAttribute,
      PullHistory,
    ]),
    ConfigModule,
  ],
  providers: [PullerService],
})
export class PullerModule {}
