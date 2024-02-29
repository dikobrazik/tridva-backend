import {Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Group} from './Group';
import {User} from './User';

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
