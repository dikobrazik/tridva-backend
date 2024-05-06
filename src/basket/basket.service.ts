import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {Group} from 'src/entities/Group';
import {Repository} from 'typeorm';

@Injectable()
export class BasketService {
  @InjectRepository(BasketItem)
  private backetItemRepository: Repository<BasketItem>;

  @InjectRepository(Group)
  private groupRepository: Repository<Group>;

  public addGroupToBasket(userId: number, groupId: number) {
    this.backetItemRepository.insert({
      user: {id: userId},
      group: {id: groupId},
    });
  }

  public addOfferToBasket(userId: number, offerId: number) {
    this.backetItemRepository.insert({
      user: {id: userId},
      offer: {id: offerId},
    });
  }

  public changeBasketItemCount(basketItemId: number, count: number) {
    this.backetItemRepository.update(basketItemId, {
      count,
    });
  }

  public async removeItemFromBasket(userId: number, itemId: number) {
    const basketItem = await this.backetItemRepository.findOne({
      where: {id: itemId, user: {id: userId}},
      relations: {group: true},
    });

    const groupId = basketItem.group.id;

    if (basketItem) {
      await this.backetItemRepository.remove(basketItem);
    }

    // костыль, надо понять, как сделать where через delete
    const group = await this.groupRepository.findOne({
      where: {id: groupId, owner: {id: userId}},
    });

    if (group) {
      await this.groupRepository.delete(groupId);
    }
  }

  public getUserBasket(userId: number) {
    return this.backetItemRepository
      .find({
        where: {user: {id: userId}},
        relations: {group: {offer: true}, offer: true},
      })
      .then((basketItems) => {
        return basketItems.map((basketItem) => {
          const offer = basketItem.group?.offer ?? basketItem.offer;

          if (basketItem.group) {
            const groupId = basketItem.group.id;

            return {
              id: basketItem.id,
              count: basketItem.count,
              group: {id: groupId, capacity: basketItem?.group.capacity},
              offer: {...offer, photos: offer.photos?.split('|')},
            };
          }

          return {
            id: basketItem.id,
            count: basketItem.count,
            group: undefined,
            offer: {...offer, photos: offer.photos?.split('|')},
          };
        });
      });
  }
}
