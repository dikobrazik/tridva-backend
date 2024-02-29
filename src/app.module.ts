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
import {GroupParticipant} from './entities/GroupParticipant';
import {ProfileModule} from './profile/profile.module';
import {BasketItem} from './entities/BasketItem';
import {BasketModule} from './basket/basket.module';

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
          User,
          Offer,
          Review,
          Category,
          Profile,
          Group,
          GroupParticipant,
          BasketItem,
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
  ],
})
export class AppModule {}
