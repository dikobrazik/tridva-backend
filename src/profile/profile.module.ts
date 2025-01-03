import {Module} from '@nestjs/common';
import {ProfileService} from './profile.service';
import {ProfileController} from './profile.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Profile} from 'src/entities/Profile';
import {User} from 'src/entities/User';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User])],
  providers: [ProfileService],
  exports: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
