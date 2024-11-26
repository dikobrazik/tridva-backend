import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {User} from './User';
import {PickupPoint} from './PickupPoint';
import {OrderOffer} from './OrderOffer';
import {OrderGroup} from './OrderGroup';

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

  @OneToMany(() => OrderGroup, (orderGroup) => orderGroup.order)
  groups: OrderGroup[];

  @OneToMany(() => OrderOffer, (orderOffer) => orderOffer.order)
  offers: OrderOffer[];

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
