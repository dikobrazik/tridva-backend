import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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
  @JoinColumn({name: 'groupId'})
  group: Group | null;

  @Column({nullable: true})
  groupId: number;

  // will be null if it's group item
  @ManyToOne(() => Offer, {eager: true, nullable: true})
  @JoinColumn({name: 'offerId'})
  offer: Offer | null;

  @Column({nullable: true})
  offerId: number;

  @ManyToOne(() => User)
  @JoinColumn({name: 'userId'})
  user: User;

  @Column()
  userId: number;

  @Column({type: 'int', default: 1})
  count: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
