import {Module} from '@nestjs/common';
import {AdminController} from './admin.controller';
import {AdminLocalStrategy} from './auth/local.strategy';
import {PassportModule} from '@nestjs/passport';
import {SessionSerializer} from './auth/session.serializer';

@Module({
  imports: [PassportModule],
  controllers: [AdminController],
  providers: [AdminLocalStrategy, SessionSerializer],
})
export class AdminModule {}
