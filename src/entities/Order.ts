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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
