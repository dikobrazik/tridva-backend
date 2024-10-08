import {Module} from '@nestjs/common';
import {AuthorizationModule} from './authorization/authorization.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {readFileSync} from 'fs';
import {User} from './entities/User';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {OffersModule} from './offers/offers.module';
import {Offer} from './entities/Offer';
import {ReviewsModule} from './reviews/reviews.module';
import {Review} from './entities/Review';
import {CategoryModule} from './category/category.module';
import {Category} from './entities/Category';
import {cwd} from 'process';
import {join} from 'path';
import {PullerModule} from './puller/puller.module';
import {GroupsModule} from './groups/groups.module';
import {Profile} from './entities/Profile';
import {Group} from './entities/Group';
import {ProfileModule} from './profile/profile.module';
import {BasketItem} from './entities/BasketItem';
import {BasketModule} from './basket/basket.module';
import {Order} from './entities/Order';
import {OrdersModule} from './orders/orders.module';
import {City} from './entities/City';
import {PickupPoint} from './entities/PickupPoint';
import {GeoModule} from './geo/geo.module';
import {Attribute} from './entities/Attribute';
import {OfferAttribute} from './entities/OfferAttribute';
import {AttributesModule} from './attributes/attributes.module';
import {PullHistory} from './entities/PullHistory';
import {OfferPhoto} from './entities/OfferPhoto';

@Module({
  imports: [
    AuthorizationModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow('DB_HOST'),
        port: configService.getOrThrow('DB_PORT'),
        username: configService.getOrThrow('DB_USERNAME'),
        password: configService.getOrThrow('DB_PASS'),
        database: configService.getOrThrow('DB_NAME'),
        ssl: {
          ca: readFileSync(join(cwd(), 'db.pem')),
        },
        synchronize: true,
        logging: configService.get('IS_DEV') === 'true',
        entities: [
          Attribute,
          OfferAttribute,
          User,
          Offer,
          OfferPhoto,
          Review,
          Category,
          Profile,
          Group,
          BasketItem,
          Order,
          City,
          PickupPoint,
          PullHistory,
        ],
        subscribers: [],
        migrations: [],
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OffersModule,
    ReviewsModule,
    CategoryModule,
    PullerModule,
    GroupsModule,
    ProfileModule,
    BasketModule,
    OrdersModule,
    GeoModule,
    AttributesModule,
  ],
})
export class AppModule {}
