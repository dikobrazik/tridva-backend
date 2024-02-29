import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';
import {Offer} from './Offer';
import {User} from './User';

@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Offer)
  @JoinColumn()
  offer: Offer;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM "group_participant" WHERE "groupId" = ${alias}.id`,
  })
  participantsCount: number;

  @Column({type: 'int'})
  capacity: number;

  @ManyToOne(() => User)
  @JoinColumn()
  owner: User;

  @CreateDateColumn()
  createdAt: number;
}
