import {Offer} from 'src/entities/Offer';
import {FindOptionsSelect} from 'typeorm';

export const LIST_OFFER_VIEW: FindOptionsSelect<Offer> = {
  id: true,
  title: true,
  price: true,
  discount: true,
  ordersCount: true,
  reviewsCount: true,
  rating: true,
};
