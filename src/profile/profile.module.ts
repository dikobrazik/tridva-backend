import {Module} from '@nestjs/common';
import {ProfileService} from './profile.service';
import {ProfileController} from './profile.controller';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Profile} from 'src/entities/Profile';
import {User} from 'src/entities/User';
import {ObjectStorageModule} from 'src/object-storage/object-storage.module';
import {ProfileAvatarService} from './profile-avatar.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, User]), ObjectStorageModule],
  providers: [ProfileService, ProfileAvatarService],
  exports: [ProfileService],
  controllers: [ProfileController],
})
export class ProfileModule {}
