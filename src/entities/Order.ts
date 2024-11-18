import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Group} from './Group';
import {Offer} from './Offer';
import {User} from './User';
import {PickupPoint} from './PickupPoint';

export enum OrderStatus {
  CREATED,
  PAID,
  IN_DELIVERY,
  DELIVERED,
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Group)
  @JoinColumn({name: 'groupId'})
  group: Group | null;

  @Column({nullable: true})
  groupId: number | null;

  @ManyToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: Offer | null;

  @Column({nullable: true})
  offerId: number | null;

  @ManyToOne(() => User)
  @JoinColumn({name: 'userId'})
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => PickupPoint)
  @JoinColumn({name: 'pickupPointId'})
  pickupPoint: PickupPoint;

  @Column()
  pickupPointId: number;

  @Column()
  count: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.CREATED,
  })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
