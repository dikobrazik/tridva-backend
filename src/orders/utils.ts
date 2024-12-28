import {BasketItem} from 'src/entities/BasketItem';
import {sum} from 'src/shared/utils/sum';

export const getOffersTotalAmount = (
  basketGroups: BasketItem[],
  basketOffers: BasketItem[],
) => {
  return sum(
    ...basketGroups.map((basketItem) => {
      const offer = basketItem.group.offer;

      const offerPrice = Number(offer.price) / (1 + offer.discount / 100);

      return offerPrice * basketItem.count;
    }),
    ...basketOffers.map((basketItem) => {
      const offerPrice = basketItem.offer.price;

      return offerPrice * basketItem.count;
    }),
  );
};
