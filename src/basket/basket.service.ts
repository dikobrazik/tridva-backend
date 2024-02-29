import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {Repository} from 'typeorm';

@Injectable()
export class BasketService {
  @InjectRepository(BasketItem)
  private backetItemRepository: Repository<BasketItem>;

  public addGroupToBasket(userId: number, groupId: number) {
    return this.backetItemRepository.insert({
      user: {id: userId},
      group: {id: groupId},
    });
  }

  public getUserBasket(userId: number) {
    return this.backetItemRepository
      .find({
        where: {user: {id: userId}},
        relations: {group: {offer: true}},
      })
      .then((basketItems) =>
        basketItems.map(({id, group: {offer}}) => ({
          id,
          offer: {...offer, photos: offer.photos?.split('|')},
        })),
      );
  }
}
