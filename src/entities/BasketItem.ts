import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {User} from './User';
import {Group} from './Group';
import {Offer} from './Offer';

@Entity()
export class BasketItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group, {eager: true, nullable: true})
  @JoinColumn()
  group: Group | null;

  @ManyToOne(() => Offer, {eager: true, nullable: true})
  @JoinColumn()
  offer: Offer | null;

  @ManyToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({type: 'int', default: 1})
  count: number;

  @CreateDateColumn()
  createdAt: number;
}
