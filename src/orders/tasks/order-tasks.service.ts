import {Inject, Injectable} from '@nestjs/common';
import {SchedulerRegistry} from '@nestjs/schedule';
import {InjectDataSource} from '@nestjs/typeorm';
import {OrderStatus, PaymentStatus} from 'src/entities/enums';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';
import {Payment} from 'src/entities/Payment';
import {DataSource} from 'typeorm';

@Injectable()
export class OrderTasksService {
  @InjectDataSource()
  private dataSource: DataSource;

  @Inject(SchedulerRegistry)
  private schedulerRegistry: SchedulerRegistry;

  addCancelationTask(orderId: number) {
    if (
      !this.schedulerRegistry.doesExist('timeout', this.getTaskName(orderId))
    ) {
      const callback = () => {
        const queryRunner = this.dataSource.createQueryRunner();

        Promise.all([
          queryRunner.manager.update(
            Payment,
            {orderId},
            {
              status: PaymentStatus.CANCELED,
            },
          ),
          queryRunner.manager.update(
            OrderGroup,
            {orderId},
            {
              status: OrderStatus.CANCELED,
            },
          ),
          queryRunner.manager.update(
            OrderOffer,
            {orderId},
            {
              status: OrderStatus.CANCELED,
            },
          ),
        ]);
      };
      const timeoutId = setTimeout(callback, 60 * 1000);
      this.schedulerRegistry.addTimeout(this.getTaskName(orderId), timeoutId);
    }
  }

  removeCancelationTask(orderId: number) {
    if (
      this.schedulerRegistry.doesExist('timeout', this.getTaskName(orderId))
    ) {
      this.schedulerRegistry.deleteTimeout(this.getTaskName(orderId));
    }
  }

  private getTaskName(orderId: number) {
    return `cancel-order-${orderId}`;
  }
}
