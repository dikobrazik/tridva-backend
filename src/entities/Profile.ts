import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {PickupPoint} from './PickupPoint';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  name: string;

  @Column({nullable: true})
  email: string;

  @Column({nullable: true})
  birthdate: string;

  @Column({nullable: true})
  sex: string;

  @ManyToOne(() => PickupPoint, {nullable: true})
  @JoinColumn({name: 'lastSelectedPickupPointId'})
  lastSelectedPickupPoint: PickupPoint;

  @Column({nullable: true})
  lastSelectedPickupPointId: string;
}
