import {Injectable} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {Group} from 'src/entities/Group';
import {BasketMapper} from 'src/mappers/basket';
import {DataSource, Repository} from 'typeorm';

@Injectable()
export class BasketService {
  @InjectDataSource()
  private dataSource: DataSource;

  @InjectRepository(BasketItem)
  private basketItemRepository: Repository<BasketItem>;
  @InjectRepository(Group)
  private groupRepository: Repository<Group>;

  public async addGroupToBasket(userId: number, groupId: number) {
    const {
      identifiers: [{id: basketItemId}],
    } = await this.basketItemRepository.insert({
      user: {id: userId},
      group: {id: groupId},
    });

    return this.basketItemRepository
      .findOne({where: {id: basketItemId}})
      .then(new BasketMapper().mapBasketItemToModel);
  }

  public async addOfferToBasket(userId: number, offerId: number) {
    const {
      identifiers: [{id: basketItemId}],
    } = await this.basketItemRepository.insert({
      user: {id: userId},
      offer: {id: offerId},
    });

    return this.basketItemRepository
      .findOne({where: {id: basketItemId}})
      .then(new BasketMapper().mapBasketItemToModel);
  }

  public async changeBasketItemCount(
    userId: number,
    basketItemId: number,
    count: number,
  ) {
    if (count === 0) {
      await this.removeItemFromBasket(userId, basketItemId);
    } else {
      await this.basketItemRepository.update(basketItemId, {
        count,
      });
    }
  }

  public getBasketItemCount(userId: number, basketItemId: number) {
    return this.basketItemRepository
      .findOne({where: {offer: {id: basketItemId}, user: {id: userId}}})
      .then((basketItem) => basketItem.count)
      .catch(() => 0);
  }

  public async removeItemFromBasket(userId: number, basketItemId: number) {
    await this.basketItemRepository.delete({id: basketItemId, userId});
  }

  // оставил на случай, если при удалении группы из корзины - будем удалять всю группу
  public async removeGroupFromAllBaskets(userId: number, basketItemId: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const basketItem = await this.basketItemRepository.findOne({
        select: {group: {id: true, ownerId: true}},
        where: {id: basketItemId, userId},
        relations: {group: true},
        loadEagerRelations: false,
      });

      if (basketItem) {
        await this.basketItemRepository.remove(basketItem);
      }

      const {id: groupId, ownerId} = basketItem.group;

      const isGroupOwner = ownerId === userId;

      if (groupId && isGroupOwner) {
        await this.basketItemRepository.delete({
          groupId,
        });

        await this.groupRepository.delete({
          id: groupId,
          ownerId: userId,
        });
      }

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  public getUserBasketItemByOfferId(userId: number, offerId: number) {
    return this.basketItemRepository
      .findOne({
        where: {user: {id: userId}, offer: {id: offerId}},
      })
      .catch(() => null);
  }

  public getUserBasketLastUpdatedAt(
    userId: number,
  ): Promise<BasketItem | null> {
    return this.basketItemRepository.findOne({
      select: {id: true, updatedAt: true},
      where: {userId},
      loadEagerRelations: false,
      order: {updatedAt: 'DESC'},
    });
  }

  public getUserBasket(userId: number) {
    return this.basketItemRepository
      .find({
        where: {userId},
        relations: {group: {offer: true}, offer: true},
      })
      .then((basketItems) => {
        return basketItems.map(new BasketMapper().mapBasketItemToModel);
      });
  }

  public getUserBasketItemsCount(userId: number) {
    return this.basketItemRepository.count({
      where: {userId},
      loadEagerRelations: false,
    });
  }
}
