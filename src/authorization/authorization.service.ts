import {Inject, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {BasketService} from 'src/basket/basket.service';
import {Profile} from 'src/entities/Profile';
import {User} from 'src/entities/User';
import {GroupsService} from 'src/groups/groups.service';
import {FavoriteOffersService} from 'src/offers/favoriteOffers.service';
import {SignatureContent} from 'src/shared/types';
import {getRandomName} from 'src/shared/utils/getRandomName';
import {DataSource, Repository} from 'typeorm';
import {AuthenticationService} from './authentication.service';
import {CheckCodeDto} from './dtos';

@Injectable()
export class AuthorizationService {
  @InjectRepository(User)
  private userRepository: Repository<User>;
  @InjectRepository(Profile)
  private profileRepository: Repository<Profile>;

  @InjectDataSource()
  private dataSource: DataSource;

  @Inject(ConfigService)
  private configService: ConfigService;
  @Inject(BasketService)
  private basketService: BasketService;
  @Inject(GroupsService)
  private groupsService: GroupsService;
  @Inject(FavoriteOffersService)
  private favoriteOffersService: FavoriteOffersService;
  @Inject(JwtService)
  private jwtService: JwtService;
  @Inject(AuthenticationService)
  private authenticationService: AuthenticationService;

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
    this.authenticationService.checkCode(phone, code);

    const existingUser = await this.userRepository.findOne({
      where: {phone},
      relations: {profile: true},
    });

    const existingUserId = existingUser?.id;

    if (existingUserId) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.startTransaction();

      try {
        const user = await this.userRepository.findOne({
          where: {id: userId},
          relations: {profile: true},
        });

        await this.basketService.moveItemsFromUserToUser(
          userId,
          existingUserId,
        );
        await this.groupsService.moveGroupsFromUserToUser(
          userId,
          existingUserId,
        );

        await this.favoriteOffersService.moveFavoriteOffersFromUserToUser(
          userId,
          existingUserId,
        );

        await Promise.all([
          this.userRepository.delete(userId),
          this.profileRepository.delete(user.profile.id),
        ]);

        await queryRunner.commitTransaction();

        return {
          profile: existingUser.profile,
          access_token: await this.generateAccessToken(userId),
        };
      } catch {
        await queryRunner.rollbackTransaction();
      } finally {
        await queryRunner.release();
      }
    } else {
      await this.userRepository.update(userId, {
        phone,
      });

      return {
        profile: {},
        access_token: await this.generateAccessToken(existingUserId),
      };
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
