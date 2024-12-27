import {mockType} from 'test/utils';
import {getOffersTotalAmount} from '../utils';
import {BasketItem} from 'src/entities/BasketItem';

describe('getOffersTotalAmount', () => {
  it.each([
    [[{price: 100, discount: 25, count: 1}], [], 75],
    [[], [{price: 100, discount: 25, count: 1}], 100],
    [
      [{price: 50, discount: 25, count: 5}],
      [{price: 100, discount: 25, count: 1}],
      100 + 187.5,
    ],
    [
      [
        {price: 50, discount: 25, count: 5},
        {price: 100, discount: 20, count: 2},
      ],
      [{price: 100, discount: 25, count: 1}],
      100 + 160 + 187.5,
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
