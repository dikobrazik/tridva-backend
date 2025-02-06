import {Injectable} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {InjectDataSource} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {FavoriteOffer} from 'src/entities/FavoriteOffer';
import {Group} from 'src/entities/Group';
import {Profile} from 'src/entities/Profile';
import {Review} from 'src/entities/Review';
import {User} from 'src/entities/User';
import {DataSource, IsNull} from 'typeorm';

@Injectable()
export class AuthorizationTasksService {
  @InjectDataSource()
  private dataSource: DataSource;

  @Cron('0 0 * * *')
  async cleanupUsers() {
    const qb = this.dataSource.createQueryBuilder();

    const basketItemsUserIdsQuery = this.dataSource
      .createQueryBuilder()
      .select('"userId"')
      .from(BasketItem, 'basket_item')
      .getQuery();
    const favoriteOffersUserIdsQuery = this.dataSource
      .createQueryBuilder()
      .select('"userId"')
      .from(FavoriteOffer, 'favorite_offer')
      .getQuery();
    const reviewAuthorsIdsQuery = this.dataSource
      .createQueryBuilder()
      .select('"authorId"')
      .from(Review, 'review')
      .getQuery();
    const groupOwnersIdsQuery = this.dataSource
      .createQueryBuilder()
      .select('"ownerId"')
      .from(Group, 'group')
      .getQuery();

    await qb
      .delete()
      .from(User)
      .where({phone: IsNull()})
      .andWhere(`"user".id NOT IN (${basketItemsUserIdsQuery})`)
      .andWhere(`"user".id NOT IN (${favoriteOffersUserIdsQuery})`)
      .andWhere(`"user".id NOT IN (${reviewAuthorsIdsQuery})`)
      .andWhere(`"user".id NOT IN (${groupOwnersIdsQuery})`)
      .execute();

    const userIdsQuery = this.dataSource
      .createQueryBuilder()
      .select('"profileId"')
      .from(User, 'user')
      .getQuery();

    await qb
      .delete()
      .from(Profile)
      .where(`"profile".id NOT IN (${userIdsQuery})`)
      .execute();
  }
}
