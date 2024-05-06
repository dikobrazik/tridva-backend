import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Group} from './Group';
import {Offer} from './Offer';
import {User} from './User';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Group)
  @JoinColumn()
  group: string | null;

  @ManyToOne(() => Offer)
  @JoinColumn()
  offer: string | null;

  @ManyToOne(() => User)
  @JoinColumn()
  user: string;

  @Column()
  pickupPointId: string;

  @Column()
  offersCount: number;

  @CreateDateColumn()
  createdAt: number;
}
