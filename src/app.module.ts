import {Module} from '@nestjs/common';
import {AuthorizationModule} from './authorization/authorization.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {readFileSync} from 'fs';
import {User} from './entities/User';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {OffersModule} from './offers/offers.module';
import {Offer} from './entities/Offer';

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
          ca: readFileSync('/Users/d/Downloads/RootCA.pem'),
        },
        dropSchema: true,
        synchronize: true,
        logging: true,
        entities: [User, Offer],
        subscribers: [],
        migrations: [],
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    OffersModule,
  ],
})
export class AppModule {}
