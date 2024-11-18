import {Injectable, InternalServerErrorException} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {Order, OrderStatus} from 'src/entities/Order';
import {DataSource, In, ObjectLiteral, Repository} from 'typeorm';
import {CreateOrderDto} from './dtos';
import {BasketItem} from 'src/entities/BasketItem';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';
import {sum} from 'src/shared/utils/sum';

@Injectable()
export class OrdersService {
  @InjectRepository(Order)
  private ordersRepository: Repository<Order>;
  @InjectRepository(BasketItem)
  private basketItemRepository: Repository<BasketItem>;

  @InjectDataSource()
  private dataSource: DataSource;

  public async createOrder(createOrderDto: CreateOrderDto, userId: number) {
    let createdOrdersIdentifiers: ObjectLiteral[] = [];

    const selectedBasketItems = await this.basketItemRepository.find({
      where: {id: In(createOrderDto.basketItemsIds), userId},
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const orders = selectedBasketItems.map<QueryDeepPartialEntity<Order>>(
        (basketItem) => ({
          groupId: basketItem.groupId,
          offerId: basketItem.offerId,
          pickupPointId: createOrderDto.pickupPointId,
          userId,
          count: basketItem.count,
          // TODO: пока нет кассы, далее - CREATED
          status: OrderStatus.PAID,
        }),
      );

      createdOrdersIdentifiers = (await this.ordersRepository.insert(orders))
        .identifiers;
      await this.basketItemRepository.delete(
        selectedBasketItems.map((basketItem) => basketItem.id),
      );

      await queryRunner.commitTransaction();
    } catch {
      await queryRunner.rollbackTransaction();

      throw new InternalServerErrorException();
    } finally {
      await queryRunner.release();
    }

    if (createdOrdersIdentifiers.length) {
      // TODO: считаем сколько нужно будет оплатит (надо добавить вычет скидки)
      sum(
        ...selectedBasketItems.map((basketItem) => {
          const offerPrice =
            basketItem.groupId !== null
              ? basketItem.group.offer.price
              : basketItem.offer.price;

          return offerPrice * basketItem.count;
        }),
      );
    }
  }
}
