import {Module} from '@nestjs/common';
import {GroupsController} from './groups.controller';
import {GroupsService} from './groups.service';
import {JwtModule} from '@nestjs/jwt';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Group} from 'src/entities/Group';
import {BasketItem} from 'src/entities/BasketItem';
import {User} from 'src/entities/User';
import {BasketModule} from 'src/basket/basket.module';

@Module({
  imports: [
    BasketModule,
    JwtModule,
    TypeOrmModule.forFeature([User, Group, BasketItem]),
  ],
  controllers: [GroupsController],
  providers: [GroupsService],
})
export class GroupsModule {}
