import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Offer} from './Offer';

@Entity()
export class OfferPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: Offer;

  @Column()
  offerId: number;

  @Column()
  photoUrl: string;
}
