import {Module} from '@nestjs/common';
import {AdminController} from './admin.controller';
import {AdminLocalStrategy} from './auth/local.strategy';
import {PassportModule} from '@nestjs/passport';
import {SessionSerializer} from './auth/session.serializer';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Order} from 'src/entities/Order';
import {AdminService} from './admin.service';
import {User} from 'src/entities/User';
import {Profile} from 'src/entities/Profile';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([Order, OrderGroup, OrderOffer, User, Profile]),
  ],
  controllers: [AdminController],
  providers: [AdminLocalStrategy, SessionSerializer, AdminService],
})
export class AdminModule {}
