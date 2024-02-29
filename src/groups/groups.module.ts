import {Module} from '@nestjs/common';
import {GroupsController} from './groups.controller';
import {GroupsService} from './groups.service';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Group} from 'src/entities/Group';
import {GroupParticipant} from 'src/entities/GroupParticipant';
import {BasketItem} from 'src/entities/BasketItem';
import {User} from 'src/entities/User';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([User, Group, GroupParticipant, BasketItem]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
