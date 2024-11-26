import {Inject, Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {Order, OrderStatus} from 'src/entities/Order';
import {DataSource, In, Repository} from 'typeorm';
import {CreateOrderDto} from './dtos';
import {BasketItem} from 'src/entities/BasketItem';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';
import {sum} from 'src/shared/utils/sum';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';
import {KassaService} from 'src/kassa/kassa.service';
import {Payment} from 'src/entities/Payment';

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
      where: {order: {userId, status: OrderStatus.PAID}},
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
        // TODO: пока нет кассы, далее - CREATED
        status: OrderStatus.CREATED,
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

      const totalAmount =
        sum(
          ...selectedBasketItems.map((basketItem) => {
            const offerPrice =
              basketItem.groupId !== null
                ? basketItem.group.offer.price
                : basketItem.offer.price;

            return offerPrice * basketItem.count;
          }),
        ) * 100;

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
}
