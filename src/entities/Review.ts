import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {User} from './User';
import {Offer} from './Offer';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User)
  authorId: number;

  @Column()
  text: string;

  @Column({type: 'int'})
  rating: number;

  @ManyToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: number;

  @Column()
  offerId: number;

  @CreateDateColumn()
  createdAt: number;
}
