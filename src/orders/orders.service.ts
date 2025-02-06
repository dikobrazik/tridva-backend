import {Inject, Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {OrderStatus} from 'src/entities/enums';
import {Offer} from 'src/entities/Offer';
import {Order} from 'src/entities/Order';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';
import {Payment} from 'src/entities/Payment';
import {User} from 'src/entities/User';
import {KassaService} from 'src/kassa/kassa.service';
import {
  DataSource,
  FindOptionsSelect,
  In,
  Not,
  QueryRunner,
  Repository,
} from 'typeorm';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';
import {CancelOrderDto, CreateOrderDto} from './dtos';
import {convertRublesToKopecks, getOffersTotalAmount} from './utils';

const getOrdersWhere = (userId: User['id']) => [
  {
    userId,
    offers: {
      status: Not(In([OrderStatus.CANCELED, OrderStatus.CREATED])),
    },
  },
  {
    userId,
    groups: {
      status: Not(In([OrderStatus.CANCELED, OrderStatus.CREATED])),
    },
  },
];

@Injectable()
export class OrdersService {
  @InjectRepository(Order)
  private ordersRepository: Repository<Order>;
  @InjectRepository(Payment)
  private paymentRepository: Repository<Payment>;
  @InjectRepository(BasketItem)
  private basketItemRepository: Repository<BasketItem>;

  @Inject(KassaService)
  private kassaService: KassaService;

  @InjectDataSource()
  private dataSource: DataSource;

  public async getUserOrders(userId: number) {
    const offerSelect: FindOptionsSelect<Offer> = {
      id: true,
      title: true,
      discount: true,
      price: true,
    };

    return this.ordersRepository
      .find({
        select: {
          id: true,
          offers: {status: true, count: true, offer: offerSelect},
          groups: {
            status: true,
            count: true,
            group: {id: true, offer: offerSelect},
          },
          createdAt: true,
          updatedAt: true,
        },
        where: getOrdersWhere(userId),
        relations: {
          offers: {offer: true},
          groups: {group: {offer: true}},
          pickupPoint: true,
        },
        order: {updatedAt: 'DESC'},
      })
      .then((orders) => {
        return orders.map(({offers, groups, ...order}) => {
          const items = offers
            .map((orderOffer) => ({
              isGroupItem: false,
              offer: orderOffer.offer,
              status: orderOffer.status,
              count: orderOffer.count,
            }))
            .concat(
              groups.map((group) => ({
                isGroupItem: true,
                offer: group.group.offer,
                status: group.status,
                count: group.count,
              })),
            );

          return {
            ...order,
            items,
          };
        });
      });
  }

  public getUserOrdersCount(userId: number) {
    return this.ordersRepository.count({
      where: getOrdersWhere(userId),
    });
  }

  public async createOrder(createOrderDto: CreateOrderDto, userId: number) {
    const selectedBasketItems = await this.basketItemRepository.find({
      where: {id: In(createOrderDto.basketItemsIds), userId},
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const order: QueryDeepPartialEntity<Order> = {
        pickupPointId: createOrderDto.pickupPointId,
        userId,
      };

      const [{id: orderId}] = (await queryRunner.manager.insert(Order, order))
        .identifiers;

      await this.moveBasketItemsToOrder(
        queryRunner,
        selectedBasketItems,
        orderId,
      );

      const {offerItems, groupItems} =
        this.groupBasketItems(selectedBasketItems);

      const totalAmount = convertRublesToKopecks(
        getOffersTotalAmount(
          groupItems.map((basketItem) => ({
            offer: basketItem.group.offer,
            count: basketItem.count,
          })),
          offerItems.map((basketItem) => ({
            offer: basketItem.offer,
            count: basketItem.count,
          })),
        ),
      );

      const response = await this.kassaService.initPayment(
        orderId,
        totalAmount,
      );

      if (response.Success) {
        await queryRunner.manager.insert(Payment, {
          id: response.PaymentId,
          amount: totalAmount,
          orderId,
          url: response.PaymentURL,
        });
      }

      await queryRunner.commitTransaction();

      return response.PaymentURL;
    } catch (e) {
      console.error(e);

      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  private groupBasketItems(basketItems: BasketItem[]) {
    return {
      offerItems: basketItems.filter(
        (basketItem) => basketItem.offerId !== null,
      ),
      groupItems: basketItems.filter(
        (basketItem) => basketItem.groupId !== null,
      ),
    };
  }

  private async moveBasketItemsToOrder(
    queryRunner: QueryRunner,
    basketItems: BasketItem[],
    orderId: number,
  ) {
    const {offerItems, groupItems} = this.groupBasketItems(basketItems);

    if (offerItems.length) {
      await queryRunner.manager.insert(
        OrderOffer,
        offerItems.map((basketItem) => ({
          count: basketItem.count,
          offerId: basketItem.offerId,
          orderId,
        })),
      );
    }
    if (groupItems.length) {
      await queryRunner.manager.insert(
        OrderGroup,
        groupItems.map((basketItem) => ({
          count: basketItem.count,
          groupId: basketItem.groupId,
          orderId,
        })),
      );
    }

    await queryRunner.manager.delete(
      BasketItem,
      basketItems.map((basketItem) => basketItem.id),
    );
  }

  public getIsUserOrder({orderId}: CancelOrderDto, userId: number) {
    return this.ordersRepository.exist({
      where: {
        id: orderId,
        userId,
      },
    });
  }

  public getOrderPaymentUrl({orderId}: CancelOrderDto, userId: number) {
    return this.paymentRepository
      .findOne({
        where: {
          order: {
            id: orderId,
            userId,
          },
        },
      })
      .then((payment) => payment.url);
  }
}
