import {Module} from '@nestjs/common';
import {GroupsController} from './groups.controller';
import {GroupsService} from './groups.service';
import {JwtModule} from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
