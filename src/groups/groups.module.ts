import {Module} from '@nestjs/common';
import {GroupsController} from './groups.controller';
import {GroupsService} from './groups.service';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Group} from 'src/entities/Group';
import {GroupParticipant} from 'src/entities/GroupParticipant';

@Module({
  imports: [JwtModule, TypeOrmModule.forFeature([Group, GroupParticipant])],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
