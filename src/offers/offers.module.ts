import {Module} from '@nestjs/common';
import {OffersController} from './offers.controller';
import {OffersService} from './offers.service';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Offer} from 'src/entities/Offer';
import {Category} from 'src/entities/Category';
import {CategoryService} from 'src/category/category.service';
import {GroupsService} from 'src/groups/groups.service';
import {GroupParticipant} from 'src/entities/GroupParticipant';
import {Group} from 'src/entities/Group';

@Module({
  imports: [
    TypeOrmModule.forFeature([Offer, Category, GroupParticipant, Group]),
  ],
  controllers: [OffersController],
  providers: [OffersService, CategoryService, GroupsService],
  exports: [OffersService],
})
export class OffersModule {}
