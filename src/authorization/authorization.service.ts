import {Inject, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import {User} from 'src/entities/User';
import {SignatureContent} from 'src/shared/types';
import {Repository} from 'typeorm';
import {CheckCodeDto} from './dtos';
import {Profile} from 'src/entities/Profile';
import {ConfigService} from '@nestjs/config';
import {getRandomName} from 'src/shared/utils/getRandomName';

@Injectable()
export class AuthorizationService {
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Profile)
  private profileRepository: Repository<Profile>;

  @Inject(ConfigService)
  private configService: ConfigService;
  @Inject(JwtService)
  private jwtService: JwtService;

  async sendCode(_phone: string) {}

  async isAccessTokenValid(token: string) {
    const userId = await this.parseAccessToken(token);

    const user = await this.userRepository.findOne({
      where: {id: userId},
    });

    return Boolean(user);
  }

  async isUserAnonymous(token: string) {
    const userId = await this.parseAccessToken(token);

    const user = await this.userRepository.findOne({
      where: {id: userId},
    });

    return !user.phone;
  }

  async createAnonymous() {
    const {
      identifiers: [{id: profileId}],
    } = await this.profileRepository.insert({name: getRandomName()});
    const {
      identifiers: [{id: userId}],
    } = await this.userRepository.insert({profile: {id: profileId}});

    return {
      userId,
      access_token: await this.jwtService.signAsync({
        userId,
      } as SignatureContent),
    };
  }

  async signInOrUp(userId: number, {phone, code}: CheckCodeDto) {
    const existingUser = await this.userRepository.findOne({
      where: {phone},
      relations: {profile: true},
    });

    const existingUserId = existingUser?.id;

    if (existingUserId) {
      const user = await this.userRepository.findOne({
        where: {id: userId},
        relations: {profile: true},
      });

      await this.userRepository.update(existingUserId, {
        phone,
      });

      await Promise.all([
        this.userRepository.delete(userId),
        this.profileRepository.delete(user.profile.id),
      ]);

      return {
        profile: existingUser.profile,
        access_token: await this.jwtService.signAsync({
          userId: existingUserId,
        } as SignatureContent),
      };
    } else {
      await this.userRepository.update(userId, {
        phone,
      });

      return {
        profile: {},
        access_token: await this.jwtService.signAsync({
          userId,
        } as SignatureContent),
      };
    }
  }

  getUser(userId: number): Promise<User> {
    return this.userRepository.findOne({
      where: {id: userId},
      relations: {profile: true},
    });
  }

  parseAccessToken(token: string): Promise<number> {
    return this.jwtService
      .verifyAsync<SignatureContent>(token, {
        secret: this.configService.getOrThrow('SC'),
      })
      .then((result) => result.userId);
  }
}
