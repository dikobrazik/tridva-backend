import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {Group} from 'src/entities/Group';
import {Repository} from 'typeorm';

@Injectable()
export class BasketService {
  @InjectRepository(BasketItem)
  private basketItemRepository: Repository<BasketItem>;

  @InjectRepository(Group)
  private groupRepository: Repository<Group>;

  public async addGroupToBasket(userId: number, groupId: number) {
    await this.basketItemRepository.insert({
      user: {id: userId},
      group: {id: groupId},
    });
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
      .then((basketItem) => this.formatSingleOfferBasketItem(basketItem));
  }

  public async changeBasketItemCount(
    userId: number,
    basketItemId: number,
    count: number,
  ) {
    if (count === 0) {
      this.removeItemFromBasket(userId, basketItemId);
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
    const basketItem = await this.basketItemRepository.findOne({
      where: {id: basketItemId, user: {id: userId}},
      relations: {group: true},
    });

    const groupId = basketItem.group.id;

    if (basketItem) {
      await this.basketItemRepository.remove(basketItem);
    }

    // костыль, надо понять, как сделать where через delete
    const group = await this.groupRepository.findOne({
      where: {id: groupId, owner: {id: userId}},
    });

    if (group) {
      await this.groupRepository.remove(group);
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
      order: {updatedAt: 'DESC'},
    });
  }

  public getUserBasket(userId: number) {
    return this.basketItemRepository
      .find({
        where: {user: {id: userId}},
        relations: {group: {offer: true, owner: true}, offer: true},
      })
      .then((basketItems) => {
        return basketItems.map((basketItem) => {
          const isGroupItem = Boolean(basketItem.group.id);

          if (isGroupItem) {
            return this.formatGroupBasketItem(basketItem, userId);
          }

          return this.formatSingleOfferBasketItem(basketItem);
        });
      });
  }

  public getUserBasketItemsCount(userId: number) {
    return this.basketItemRepository.count({
      where: {user: {id: userId}},
      relations: {group: {offer: true, owner: true}, offer: true},
    });
  }

  private getBasketItemOffer(basketItem: BasketItem) {
    const isGroupItem = Boolean(basketItem.group.id);

    return isGroupItem ? basketItem.group.offer : basketItem.offer;
  }

  private formatSingleOfferBasketItem(basketItem: BasketItem) {
    const offer = this.getBasketItemOffer(basketItem);

    return {
      id: basketItem.id,
      count: basketItem.count,
      group: undefined,
      offer,
    };
  }

  private formatGroupBasketItem(basketItem: BasketItem, userId: number) {
    const offer = this.getBasketItemOffer(basketItem);

    const groupId = basketItem.group.id;

    return {
      id: basketItem.id,
      count: basketItem.count,
      group: {
        id: groupId,
        owner: basketItem.group.owner.id === userId,
        capacity: basketItem.group.capacity,
      },
      offer,
    };
  }
}
