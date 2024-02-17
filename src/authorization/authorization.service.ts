import {Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from 'src/entities/User';
import {SignatureContent} from 'src/shared/types';
import {Repository} from 'typeorm';
import {CheckCodeDto} from './dtos';
import {Profile} from 'src/entities/Profile';

@Injectable()
export class AuthorizationService {
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Profile)
  private profileRepository: Repository<Profile>;

  constructor(private jwtService: JwtService) {}

  async sendCode(phone: string) {}

  async signInOrUp({phone, code}: CheckCodeDto) {
    let user = await this.userRepository.findOne({
      where: {phone},
    });

    let userId = user?.id;

    if (!userId) {
      const {
        identifiers: [{id: profileId}],
      } = await this.profileRepository.insert({});
      const insertResult = await this.userRepository.insert({
        phone,
        profile: {id: profileId},
      });

      userId = insertResult.identifiers[0].id;
    }

    return {
      access_token: await this.jwtService.signAsync({
        userId,
      } as SignatureContent),
    };
  }
}
