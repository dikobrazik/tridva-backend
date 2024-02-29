import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Offer} from './Offer';
import {User} from './User';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Offer)
  @JoinColumn()
  offer: Offer;

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User;

  @CreateDateColumn()
  createdAt: number;
}
