import {
  AfterLoad,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Order} from './Order';
import {Offer} from './Offer';
import {OrderStatus, OrderStatusText} from './enums';

@Entity()
export class OrderOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order)
  @JoinColumn({name: 'orderId'})
  order: Order;

  @Column()
  orderId: number;

  @OneToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: Offer;

  @Column()
  offerId: number;

  @Column()
  count: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @AfterLoad()
  setStatusText() {
    this.statusText = OrderStatusText[this.status];
  }

  statusText: Values<typeof OrderStatusText>;
}
