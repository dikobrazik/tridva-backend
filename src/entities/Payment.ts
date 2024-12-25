import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import {Order} from './Order';
import {PaymentStatus} from './enums';

@Entity()
export class Payment {
  @PrimaryColumn()
  id: string;

  @OneToOne(() => Order)
  @JoinColumn({name: 'orderId'})
  order: Order;

  @Column()
  orderId: number;

  @Column({nullable: true})
  amount: number;

  @Column({
    enum: PaymentStatus,
    default: PaymentStatus.CREATED,
    nullable: true,
  })
  status: PaymentStatus;

  @CreateDateColumn()
  createdAt: Date;
}
