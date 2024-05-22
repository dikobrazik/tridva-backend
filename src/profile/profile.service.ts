import {Injectable} from '@nestjs/common';
import {UpdateProfileDto} from './dtos';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Profile} from 'src/entities/Profile';

@Injectable()
export class ProfileService {
  @InjectRepository(Profile)
  private profileRepository: Repository<Profile>;

  async updateProfile(
    userId: number,
    profile: UpdateProfileDto,
  ): Promise<void> {
    await this.profileRepository.update({id: userId}, profile);
  }

  getProfile(userId: number): Promise<Profile> {
    return this.profileRepository.findOne({where: {id: userId}});
  }
}
