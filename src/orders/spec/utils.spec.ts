import {mockType} from 'test/utils';
import {getOffersTotalAmount} from '../utils';
import {BasketItem} from 'src/entities/BasketItem';

describe('getOffersTotalAmount', () => {
  it.each([
    [[{price: 125, discount: 25, count: 1}], [], 100],
    [[], [{price: 100, discount: 25, count: 1}], 100],
    [
      [{price: 50, discount: 25, count: 5}],
      [{price: 100, discount: 25, count: 1}],
      200 + 100,
    ],
    [
      [
        {price: 50, discount: 25, count: 5},
        {price: 125, discount: 25, count: 2},
      ],
      [{price: 100, discount: 25, count: 1}],
      400 + 100,
    ],
  ])(
    'должен правильно посчитать сумму товаров',
    (groupItems, offerItems, totalAmount) => {
      const offersTotalAmount = getOffersTotalAmount(
        groupItems.map(({price, discount, count}) =>
          mockType<BasketItem>({
            group: mockType({offer: mockType({price, discount})}),
            count,
          }),
        ),
        offerItems.map(({price, discount, count}) =>
          mockType<BasketItem>({offer: mockType({price, discount}), count}),
        ),
      );

      expect(offersTotalAmount).toEqual(totalAmount);
    },
  );
});
