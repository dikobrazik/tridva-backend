import {BadRequestException, Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {OrderStatus, PaymentStatus} from 'src/entities/enums';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';
import {Payment} from 'src/entities/Payment';
import {KassaService} from 'src/kassa/kassa.service';
import {KassaNotification} from 'src/kassa/types';
import {Repository} from 'typeorm';

@Injectable()
export class OrdersPaymentNotificationService {
  @InjectRepository(Payment)
  private paymentRepository: Repository<Payment>;
  @InjectRepository(OrderGroup)
  private orderGroupsRepository: Repository<OrderGroup>;
  @InjectRepository(OrderOffer)
  private orderOffersRepository: Repository<OrderOffer>;

  @Inject(KassaService)
  private kassaService: KassaService;

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
