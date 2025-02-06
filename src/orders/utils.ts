import {Offer} from 'src/entities/Offer';
import {sum} from 'src/shared/utils/sum';

type Item = {
  offer: Offer;
  count: number;
};

export const getGroupAmount = ({offer, count}: Item) =>
  (Number(offer.price) / (1 + offer.discount / 100)) * count;

export const getOfferAmount = ({offer, count}: Item) => offer.price * count;

export const getOffersTotalAmount = (groups: Item[], offers: Item[] = []) => {
  return sum(...groups.map(getGroupAmount), ...offers.map(getOfferAmount));
};

export const convertRublesToKopecks = (rub: number) => Math.floor(rub * 100);

export const convertKopecksToRubles = (rub: number) => rub / 100;
