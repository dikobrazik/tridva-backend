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

  // will be null if it's single item
  @ManyToOne(() => Group, {eager: true, nullable: true})
  @JoinColumn()
  group: Group | null;

  // will be null if it's group item
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
