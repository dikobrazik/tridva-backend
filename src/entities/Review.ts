import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {User} from './User';
import {Offer} from './Offer';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  authorId: number;

  @Column()
  text: string;

  @ManyToOne(() => Offer)
  offerId: number;

  @CreateDateColumn()
  createdAt: number;
}
