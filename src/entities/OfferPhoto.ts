import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Offer} from './Offer';

@Entity()
export class OfferPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: Offer;

  @Column()
  @Index({unique: true})
  offerId: number;

  @Column()
  photoBaseUrl: string;

  @Column({type: 'smallint', default: 0})
  photosCount: number;
}
