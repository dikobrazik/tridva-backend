import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';
import {User} from './User';
import {Offer} from './Offer';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Offer)
  @JoinColumn()
  offer: Offer;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM "group_participant" WHERE "groupId" = ${alias}.id`,
  })
  participantsCount: number;

  @OneToOne(() => User)
  @JoinColumn()
  owner: User;

  @CreateDateColumn()
  createdAt: number;
}
