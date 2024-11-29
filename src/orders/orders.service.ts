import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {Order} from 'src/entities/Order';
import {DataSource, In, Repository} from 'typeorm';
import {CancelOrderDto, CreateOrderDto} from './dtos';
import {BasketItem} from 'src/entities/BasketItem';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';
import {sum} from 'src/shared/utils/sum';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';
import {KassaService} from 'src/kassa/kassa.service';
import {Payment} from 'src/entities/Payment';
import {KassaNotification} from 'src/kassa/types';
import {OrderStatus} from 'src/entities/enums';

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
    return this.orderOffersRepository.find({
      where: {status: OrderStatus.PAID, order: {userId}},
      relations: {offer: true, order: {pickupPoint: true}},
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
          orderId,
        });
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    return paymentURL;
  }

  public async cancelOrder(cancelOrderDto: CancelOrderDto, userId: number) {
    const {orderId, offerId} = cancelOrderDto;
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const orderOffer = await this.orderOffersRepository.findOne({
        where: {
          order: {userId},
          orderId,
          offerId,
        },
        relations: {offer: true},
      });

      const {id: orderPaymentId} = await this.paymentRepository.findOne({
        select: {id: true},
        where: {orderId},
      });

      const cancelResponse = await this.kassaService.cancelPayment(
        String(orderPaymentId),
        orderOffer.offer.price * orderOffer.count * 100,
      );

      if (cancelResponse.Success) {
        await this.orderOffersRepository.delete({
          order: {userId},
          orderId,
          offerId,
        });

        // удаляем заказ, если у него была только одна группа или товар
        if (
          !(
            (await this.orderOffersRepository.exist({where: {orderId}})) &&
            (await this.orderGroupsRepository.exist({where: {orderId}}))
          )
        ) {
          await this.ordersRepository.delete({id: orderId});
        }
      }

      await queryRunner.commitTransaction();
    } catch (e) {
      console.log(e);

      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }
  }

  public getIsUserOrder({orderId, offerId}: CancelOrderDto, userId: number) {
    return this.orderOffersRepository.exist({
      where: {
        order: {userId},
        orderId,
        offerId,
      },
    });
  }

  public async processNotification(notification: KassaNotification) {
    const isTokenValid = this.kassaService.checkToken(notification);

    if (isTokenValid) {
      if (notification.Success) {
        console.log(notification);
        if (notification.Status === 'CONFIRMED') {
          await this.orderGroupsRepository.update(
            {orderId: Number(notification.OrderId)},
            {status: OrderStatus.PAID},
          );
          await this.orderOffersRepository.update(
            {orderId: Number(notification.OrderId)},
            {status: OrderStatus.PAID},
          );
        }
      } else {
        console.log(notification);
        await this.orderGroupsRepository.update(
          {orderId: Number(notification.OrderId)},
          {status: OrderStatus.PAYMENT_ERROR},
        );
        await this.orderOffersRepository.update(
          {orderId: Number(notification.OrderId)},
          {status: OrderStatus.PAYMENT_ERROR},
        );
      }
    } else {
      new BadRequestException();
    }
  }
}
