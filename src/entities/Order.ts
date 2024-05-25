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
import {PickupPoint} from './PickupPoint';

export enum OrderStatus {
  CREATED,
  PROCESSED,
  IN_DELIVERY,
  DELIVERED,
}

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

  @ManyToOne(() => PickupPoint)
  @JoinColumn()
  pickupPoint: PickupPoint;

  @Column()
  offersCount: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: number;
}
