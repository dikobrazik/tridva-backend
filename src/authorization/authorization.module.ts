import {Module} from '@nestjs/common';
import {AuthorizationController} from './authorization.controller';
import {AuthorizationService} from './authorization.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/entities/User';
import {JwtModule} from '@nestjs/jwt';
import {ConfigModule, ConfigService} from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.getOrThrow('SC'),
      }),
    }),
  ],
  controllers: [AuthorizationController],
  providers: [AuthorizationService],
})
export class AuthorizationModule {}
