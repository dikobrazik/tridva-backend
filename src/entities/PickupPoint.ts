import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {City} from './City';

@Entity()
export class PickupPoint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  address: string;

  @Column({type: 'decimal'})
  longitude: number;

  @Column({type: 'decimal'})
  latitude: number;

  @ManyToOne(() => City)
  @JoinColumn()
  city: City;

  @Column()
  phone: string;
}
