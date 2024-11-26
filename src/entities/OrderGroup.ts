import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Order} from './Order';
import {Group} from './Group';

@Entity()
export class OrderGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order)
  @JoinColumn({name: 'orderId'})
  order: Order;

  @Column()
  orderId: number;

  @OneToOne(() => Group)
  @JoinColumn({name: 'groupId'})
  group: Group;

  @Column()
  groupId: number;

  @Column()
  count: number;
}
