import {BasketItem} from 'src/entities/BasketItem';
import {Group} from 'src/entities/Group';

export class BasketMapper {
  public mapBasketItemToModel(basketItem: BasketItem) {
    if (this.isGroupItem(basketItem)) {
      return this.formatGroupBasketItem(basketItem);
    }

    return this.formatSingleOfferBasketItem(basketItem);
  }

  private isGroupItem(basketItem: BasketItem) {
    return Boolean(basketItem.group.id);
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
      offer: {
        id: offer.id,
        title: offer.title,
        price: offer.price,
        discount: offer.discount,
        photos: offer.photos,
      },
    };
  }

  private formatGroupBasketItem(basketItem: BasketItem) {
    const offer = this.getBasketItemOffer(basketItem);

    return {
      id: basketItem.id,
      count: basketItem.count,
      group: this.mapGroupEntityToModel(basketItem.group),
      offer: {
        id: offer.id,
        title: offer.title,
        price: offer.price,
        discount: offer.discount,
        photos: offer.photos,
      },
    };
  }

  private mapGroupEntityToModel(group: Group) {
    const {id, ownerId, capacity} = group;
    return {id, ownerId, capacity};
  }
}
