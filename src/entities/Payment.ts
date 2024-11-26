import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import {Order} from './Order';

@Entity()
export class Payment {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => Order)
  @JoinColumn({name: 'orderId'})
  order: Order;

  @Column()
  orderId: number;

  @CreateDateColumn()
  createdAt: Date;
}
