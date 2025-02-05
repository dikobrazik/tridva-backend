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
import {FavoriteOffer} from './entities/FavoriteOffer';
import {Modifier} from './entities/Modifier';
import {OfferModifier} from './entities/OfferModifier';
import {JwtModule} from '@nestjs/jwt';
import {SmsModule} from './sms/sms.module';
import {AuthenticationService} from './authorization/authentication.service';
import {KassaModule} from './kassa/kassa.module';
import {OrderOffer} from './entities/OrderOffer';
import {OrderGroup} from './entities/OrderGroup';
import {Payment} from './entities/Payment';
import {AdminModule} from './admin/admin.module';
import {AuthorizationTasksModule} from './authorization/tasks/authorization.module';
import {ScheduleModule} from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthorizationModule,
    AuthorizationTasksModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('SC'),
      }),
    }),
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
        dropSchema: configService.get('DROP_SCHEMA') === 'true',
        logging: configService.get('IS_DEV') === 'true',
        entities: [
          Attribute,
          OfferAttribute,
          FavoriteOffer,
          User,
          Offer,
          OfferPhoto,
          Review,
          Category,
          Profile,
          Group,
          BasketItem,
          Payment,
          Order,
          OrderOffer,
          OrderGroup,
          City,
          Modifier,
          OfferModifier,
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
    SmsModule,
    KassaModule,
    AdminModule,
  ],
  providers: [AuthenticationService],
})
export class AppModule {}
