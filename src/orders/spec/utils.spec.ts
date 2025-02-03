import {mockType} from 'test/utils';
import {getOffersTotalAmount} from '../utils';

describe('getOffersTotalAmount', () => {
  it.each([
    [[{offer: {price: 125, discount: 25}, count: 1}], [], 100],
    [[], [{offer: {price: 100, discount: 25}, count: 1}], 100],
    [
      [{offer: {price: 50, discount: 25}, count: 5}],
      [{offer: {price: 100, discount: 25}, count: 1}],
      200 + 100,
    ],
    [
      [
        {offer: {price: 50, discount: 25}, count: 5},
        {offer: {price: 125, discount: 25}, count: 2},
      ],
      [{offer: {price: 100, discount: 25}, count: 1}],
      400 + 100,
    ],
  ])(
    'должен правильно посчитать сумму товаров',
    (groupItems, offerItems, totalAmount) => {
      const offersTotalAmount = getOffersTotalAmount(
        groupItems.map(({offer, count}) => ({
          offer: mockType(offer),
          count,
        })),
        offerItems.map(({offer, count}) => ({offer: mockType(offer), count})),
      );

      expect(offersTotalAmount).toEqual(totalAmount);
    },
  );
});
