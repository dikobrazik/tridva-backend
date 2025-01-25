import {Column, Entity, JoinColumn, OneToOne} from 'typeorm';
import {Offer} from './Offer';
import {OrderItem} from './OrderItem';

@Entity()
export class OrderOffer extends OrderItem {
  @OneToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: Offer;

  @Column()
  offerId: number;
}
