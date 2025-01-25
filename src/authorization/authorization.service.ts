import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {InjectRepository} from '@nestjs/typeorm';
import {Profile} from 'src/entities/Profile';
import {User} from 'src/entities/User';
import {SignatureContent} from 'src/shared/types';
import {getRandomName} from 'src/shared/utils/getRandomName';
import {Repository} from 'typeorm';
import {AuthenticationService} from './authentication.service';
import {CarrierService} from './carrier.service';
import {CheckCodeDto} from './dtos';

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
  @Inject(AuthenticationService)
  private authenticationService: AuthenticationService;
  @Inject(CarrierService)
  private carrierService: CarrierService;

  async getTokenUser(token: string) {
    const userId = await this.parseAccessToken(token);

    const user = await this.userRepository.findOne({
      where: {id: userId},
      relations: {profile: true},
    });

    return user;
  }

  async isUserAnonymous(user: User) {
    return !user.phone;
  }

  async createAnonymous() {
    const name = getRandomName();
    const {
      identifiers: [{id: profileId}],
    } = await this.profileRepository.insert({name});
    const {
      identifiers: [{id: userId}],
    } = await this.userRepository.insert({profile: {id: profileId}});

    return {
      userId,
      phone: null,
      profile: {id: profileId, name},
      access_token: await this.generateAccessToken(userId),
    };
  }

  async signInOrUp(userId: number, {phone, code}: CheckCodeDto) {
    // will throw an error if code is invalid
    const isCodeValid = this.authenticationService.checkCode(phone, code);

    if (isCodeValid) {
      const existingUser = await this.userRepository.findOne({
        where: {phone},
        relations: {profile: true},
      });

      const existingUserId = existingUser?.id;

      if (existingUserId) {
        await this.carrierService.moveUser(userId, existingUserId);

        return {
          profile: existingUser.profile,
          access_token: await this.generateAccessToken(existingUserId),
        };
      } else {
        await this.userRepository.update(userId, {
          phone,
        });

        return {
          profile: {},
          access_token: await this.generateAccessToken(userId),
        };
      }
    }
  }

  parseAccessToken(token: string): Promise<number> {
    return this.jwtService
      .verifyAsync<SignatureContent>(token, {
        secret: this.configService.getOrThrow('SC'),
      })
      .then((result) => result.userId);
  }

  private generateAccessToken(userId: number) {
    return this.jwtService.signAsync({
      userId,
      sole: Math.random(),
    } as SignatureContent);
  }
}
