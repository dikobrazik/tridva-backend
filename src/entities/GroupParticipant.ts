import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {User} from './User';
import {Group} from './Group';

@Entity()
export class GroupParticipant {
  @PrimaryGeneratedColumn()
  id: string;

  @OneToOne(() => Group)
  @JoinColumn()
  group: Group;

  @OneToOne(() => User)
  @JoinColumn()
  participant: User;
}
