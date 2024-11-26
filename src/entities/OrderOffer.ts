import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Order} from './Order';
import {Offer} from './Offer';

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
}
