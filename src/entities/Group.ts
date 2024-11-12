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

  @ManyToOne(() => Offer, {eager: true})
  @JoinColumn()
  offer: Offer;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM "order" WHERE "groupId" = ${alias}.id`,
  })
  participantsCount: number;

  @Column({type: 'int'})
  capacity: number;

  @ManyToOne(() => User)
  @JoinColumn({name: 'ownerId'})
  owner: User;

  @Column()
  ownerId: number;

  @CreateDateColumn()
  createdAt: Date;
}
