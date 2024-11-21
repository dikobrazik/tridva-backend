import {Global, Module} from '@nestjs/common';
import {AuthorizationController} from './authorization.controller';
import {AuthorizationService} from './authorization.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from 'src/entities/User';
import {Profile} from 'src/entities/Profile';
import {BasketModule} from 'src/basket/basket.module';
import {GroupsModule} from 'src/groups/groups.module';
import {OffersModule} from 'src/offers/offers.module';
import {SmsModule} from 'src/sms/sms.module';
import {AuthenticationService} from './authentication.service';

@Module({
  imports: [
    BasketModule,
    GroupsModule,
    OffersModule,
    SmsModule,
    TypeOrmModule.forFeature([User, Profile]),
  ],
  controllers: [AuthorizationController],
  providers: [AuthorizationService, AuthenticationService],
  exports: [AuthorizationService, TypeOrmModule.forFeature([User])],
})
@Global()
export class AuthorizationModule {}
