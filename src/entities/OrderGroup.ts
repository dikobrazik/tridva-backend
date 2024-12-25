import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Order} from './Order';
import {Group} from './Group';
import {OrderStatus} from './enums';

@Entity()
export class OrderGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order)
  @JoinColumn({name: 'orderId'})
  order: Order;

  @Column()
  orderId: number;

  @ManyToOne(() => Group)
  @JoinColumn({name: 'groupId'})
  group: Group;

  @Column()
  groupId: number;

  @Column()
  count: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;
}
