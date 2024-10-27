import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Offer} from './Offer';
import {User} from './User';

@Entity()
@Index(['offerId', 'userId'], {unique: true})
export class FavoriteOffer {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: Offer;

  @Column()
  offerId: number;

  @ManyToOne(() => User)
  @JoinColumn({name: 'userId'})
  user: Offer;

  @Column()
  userId: number;
}
