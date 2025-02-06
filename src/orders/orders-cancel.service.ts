import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {InjectDataSource, InjectRepository} from '@nestjs/typeorm';
import {OrderStatus, PaymentStatus} from 'src/entities/enums';
import {Order} from 'src/entities/Order';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';
import {Payment} from 'src/entities/Payment';
import {KassaService} from 'src/kassa/kassa.service';
import {DataSource, Repository} from 'typeorm';
import {convertRublesToKopecks, getGroupAmount} from './utils';

@Injectable()
export class OrdersCancelService {
  @InjectRepository(Payment)
  private paymentRepository: Repository<Payment>;
  @InjectRepository(OrderGroup)
  private orderGroupsRepository: Repository<OrderGroup>;

  @Inject(KassaService)
  private kassaService: KassaService;

  @InjectDataSource()
  private dataSource: DataSource;

  public async cancelOrder(orderId: Order['id']) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.startTransaction();

    try {
      const payment = await this.paymentRepository.findOne({
        select: {id: true, amount: true},
        where: {orderId},
      });

      const cancelResponse = await this.kassaService.cancelPayment(
        String(payment.id),
        payment.amount,
      );

      console.warn('cancel response', cancelResponse);

      if (cancelResponse.Success) {
        await Promise.all([
          queryRunner.manager.update(
            Payment,
            {orderId},
            {status: PaymentStatus.RETURNED},
          ),
          queryRunner.manager.update(
            OrderGroup,
            {
              orderId,
            },
            {status: OrderStatus.CANCELED},
          ),
          queryRunner.manager.update(
            OrderOffer,
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

  public async cancelGroupOrder(groupOrderId: OrderGroup['id']) {
    const queryRunner = this.dataSource.createQueryRunner();

    const groupOrder = await this.orderGroupsRepository.findOne({
      where: {id: groupOrderId},
      relations: {order: true, group: {offer: true}},
    });

    const {orderId} = groupOrder;

    if (!groupOrder)
      throw new BadRequestException('There is no order with this group');

    const payment = await this.paymentRepository.findOne({
      select: {id: true, amount: true},
      where: {orderId},
    });

    const groupAmount = convertRublesToKopecks(
      getGroupAmount({offer: groupOrder.group.offer, count: groupOrder.count}),
    );

    if (groupAmount === payment.amount) {
      return this.cancelOrder(orderId);
    } else {
      await queryRunner.startTransaction();

      try {
        const cancelResponse = await this.kassaService.cancelPayment(
          String(payment.id),
          payment.amount,
        );

        console.warn('Group cancel response', cancelResponse);

        if (cancelResponse.Success) {
          await Promise.all([
            queryRunner.manager.update(
              Payment,
              {orderId},
              {amount: cancelResponse.NewAmount},
            ),
            queryRunner.manager.update(
              OrderGroup,
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
        throw e;
      } finally {
        await queryRunner.release();
      }
    }
  }
}
