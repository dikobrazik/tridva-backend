import {Injectable} from '@nestjs/common';
import {UpdateProfileDto} from './dtos';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Profile} from 'src/entities/Profile';

@Injectable()
export class ProfileService {
  @InjectRepository(Profile)
  private profileRepository: Repository<Profile>;

  updateProfile(profile: UpdateProfileDto) {
    this.profileRepository.upsert(profile, ['id']);
  }
}
