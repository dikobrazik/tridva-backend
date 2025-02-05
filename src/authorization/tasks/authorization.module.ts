import {Global, Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Profile} from 'src/entities/Profile';
import {User} from 'src/entities/User';
import {AuthorizationTasksService} from './authorization.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile])],
  providers: [AuthorizationTasksService],
})
@Global()
export class AuthorizationTasksModule {}
