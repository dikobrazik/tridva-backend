import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Profile} from './Profile';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: string;

  @OneToOne(() => Profile, {cascade: true})
  @JoinColumn()
  profile: Profile;
}
