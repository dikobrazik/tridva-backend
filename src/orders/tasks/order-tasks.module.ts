import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Profile} from 'src/entities/Profile';
import {User} from 'src/entities/User';
import {OrderTasksService} from './order-tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile])],
  providers: [OrderTasksService],
  exports: [OrderTasksService],
})
export class OrderTasksModule {}
