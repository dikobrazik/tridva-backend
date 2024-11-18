import {Global, Module} from '@nestjs/common';
import {AuthorizationController} from './authorization.controller';
import {AuthorizationService} from './authorization.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/entities/User';
import {JwtService} from '@nestjs/jwt';
import {Profile} from 'src/entities/Profile';
import {ConfigService} from '@nestjs/config';
import {BasketModule} from 'src/basket/basket.module';

@Module({
  imports: [BasketModule, TypeOrmModule.forFeature([User, Profile])],
  controllers: [AuthorizationController],
  providers: [AuthorizationService, ConfigService, JwtService],
  exports: [
    AuthorizationService,
    JwtService,
    TypeOrmModule.forFeature([User]),
    ConfigService,
  ],
})
@Global()
export class AuthorizationModule {}
