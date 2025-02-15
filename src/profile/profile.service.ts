import {Injectable} from '@nestjs/common';
import {UpdateProfileDto} from './dtos';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {Profile} from 'src/entities/Profile';
import {User} from 'src/entities/User';

@Injectable()
export class ProfileService {
  @InjectRepository(Profile)
  private profileRepository: Repository<Profile>;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  async updateProfile(
    userId: number,
    profile: UpdateProfileDto,
  ): Promise<void> {
    const {
      profile: {id: profileId},
    } = await this.userRepository.findOne({
      where: {id: userId},
      relations: {profile: true},
    });
    await this.profileRepository.update({id: profileId}, profile);
  }

  getProfile(userId: number): Promise<Profile> {
    return this.profileRepository.findOne({where: {id: userId}});
  }
}
