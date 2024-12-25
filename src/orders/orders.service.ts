import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {Order} from 'src/entities/Order';
import {DataSource, FindOptionsSelect, In, Not, Repository} from 'typeorm';
import {CancelOrderDto, CreateOrderDto} from './dtos';
import {BasketItem} from 'src/entities/BasketItem';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';
import {sum} from 'src/shared/utils/sum';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';
import {KassaService} from 'src/kassa/kassa.service';
import {Payment} from 'src/entities/Payment';
import {KassaNotification} from 'src/kassa/types';
import {OrderStatus, PaymentStatus} from 'src/entities/enums';
import {Offer} from 'src/entities/Offer';

@Injectable()
export class OrdersService {
  @InjectRepository(Order)
  private ordersRepository: Repository<Order>;
  @InjectRepository(Payment)
  private paymentRepository: Repository<Payment>;
  @InjectRepository(OrderGroup)
  private orderGroupsRepository: Repository<OrderGroup>;
  @InjectRepository(OrderOffer)
  private orderOffersRepository: Repository<OrderOffer>;
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
        where: [
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
        ],
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
              offer: orderOffer.offer,
              status: orderOffer.status,
              count: orderOffer.count,
            }))
            .concat(
              groups.map((group) => ({
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
    return this.orderOffersRepository.count({
      where: {status: OrderStatus.PAID, order: {userId}},
    });
  }

  public async createOrder(createOrderDto: CreateOrderDto, userId: number) {
    let orderId: number;
    let paymentURL: string;

    const selectedBasketItems = await this.basketItemRepository.find({
      where: {id: In(createOrderDto.basketItemsIds), userId},
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const basketOfferItems = selectedBasketItems.filter(
        (basketItem) => basketItem.offerId !== null,
      );
      const basketGroupItems = selectedBasketItems.filter(
        (basketItem) => basketItem.groupId !== null,
      );

      const order: QueryDeepPartialEntity<Order> = {
        pickupPointId: createOrderDto.pickupPointId,
        userId,
      };

      [{id: orderId}] = (await this.ordersRepository.insert(order)).identifiers;

      if (basketOfferItems.length) {
        await this.orderOffersRepository.insert(
          basketOfferItems.map((basketItem) => ({
            count: basketItem.count,
            offerId: basketItem.offerId,
            orderId,
          })),
        );
      }
      if (basketGroupItems.length) {
        await this.orderGroupsRepository.insert(
          basketGroupItems.map((basketItem) => ({
            count: basketItem.count,
            groupId: basketItem.groupId,
            orderId,
          })),
        );
      }

      await this.basketItemRepository.delete(
        selectedBasketItems.map((basketItem) => basketItem.id),
      );

      const totalAmount = Math.floor(
        sum(
          ...selectedBasketItems.map((basketItem) => {
            const offerPrice =
              basketItem.groupId !== null
                ? basketItem.group.offer.price
                : basketItem.offer.price;

            return offerPrice * basketItem.count;
          }),
        ) * 100,
      );

      const response = await this.kassaService.initPayment(
        orderId,
        totalAmount,
      );

      paymentURL = response.PaymentURL;

      if (response.Success) {
        await this.paymentRepository.insert({
          id: response.PaymentId,
          amount: totalAmount,
          orderId,
        });
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      console.error(e);

      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    return paymentURL;
  }

  public async cancelOrder(orderId: Order['id']) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const {id: orderPaymentId, amount} = await this.paymentRepository.findOne(
        {
          select: {id: true, amount: true},
          where: {orderId},
        },
      );

      const cancelResponse = await this.kassaService.cancelPayment(
        String(orderPaymentId),
        amount,
      );

      if (cancelResponse.Success) {
        await Promise.all([
          this.paymentRepository.update(
            {orderId},
            {status: PaymentStatus.RETURNED},
          ),
          this.orderOffersRepository.update(
            {
              orderId,
            },
            {status: OrderStatus.CANCELED},
          ),
          this.orderGroupsRepository.update(
            {
              orderId,
            },
            {status: OrderStatus.CANCELED},
          ),
        ]);
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      console.error(e);

      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  public getIsUserOrder({orderId}: CancelOrderDto, userId: number) {
    return this.ordersRepository.exist({
      where: {
        id: orderId,
        userId,
      },
    });
  }

  public async processNotification(notification: KassaNotification) {
    const isTokenValid = this.kassaService.checkToken(notification);

    if (isTokenValid) {
      // eslint-disable-next-line no-console
      console.log(notification);
      const orderId = Number(notification.OrderId);
      if (notification.Success) {
        if (notification.Status === 'CONFIRMED') {
          await Promise.all([
            this.paymentRepository.update(
              {
                orderId,
              },
              {status: PaymentStatus.RECEIVED},
            ),
            this.orderGroupsRepository.update(
              {orderId},
              {status: OrderStatus.PAID},
            ),
            this.orderOffersRepository.update(
              {orderId},
              {status: OrderStatus.PAID},
            ),
          ]);
        }
      } else {
        await Promise.all([
          this.orderGroupsRepository.update(
            {orderId},
            {status: OrderStatus.PAYMENT_ERROR},
          ),
          this.orderOffersRepository.update(
            {orderId},
            {status: OrderStatus.PAYMENT_ERROR},
          ),
        ]);
      }
    } else {
      new BadRequestException();
    }
  }
}
