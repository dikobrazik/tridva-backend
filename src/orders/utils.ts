import {Offer} from 'src/entities/Offer';
import {sum} from 'src/shared/utils/sum';

type Item = {
  offer: Offer;
  count: number;
};

export const getOffersTotalAmount = (groups: Item[], offers: Item[] = []) => {
  return sum(
    ...groups.map(({offer, count}) => {
      const offerPrice = Number(offer.price) / (1 + offer.discount / 100);

      return offerPrice * count;
    }),
    ...offers.map(({offer, count}) => {
      const offerPrice = offer.price;

      return offerPrice * count;
    }),
  );
};

export const convertRublesToKopecks = (rub: number) => Math.floor(rub * 100);

export const convertKopecksToRubles = (rub: number) => rub / 100;
