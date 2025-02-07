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

  @Column({nullable: true})
  phone: string;

  @Column({select: false, nullable: true})
  simaid: number;

  @OneToOne(() => Profile, {eager: true, cascade: true})
  @JoinColumn()
  profile: Profile;
}
