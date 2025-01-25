import {Global, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Profile} from 'src/entities/Profile';
import {User} from 'src/entities/User';
import {SmsModule} from 'src/sms/sms.module';
import {AuthenticationService} from './authentication.service';
import {AuthorizationController} from './authorization.controller';
import {AuthorizationService} from './authorization.service';
import {CarrierService} from './carrier.service';

@Module({
  imports: [SmsModule, TypeOrmModule.forFeature([User, Profile])],
  controllers: [AuthorizationController],
  providers: [AuthorizationService, AuthenticationService, CarrierService],
  exports: [AuthorizationService, TypeOrmModule.forFeature([User])],
})
@Global()
export class AuthorizationModule {}
