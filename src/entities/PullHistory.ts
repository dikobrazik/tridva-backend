import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PullHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  date: string;

  @UpdateDateColumn()
  updatedAt: number;
}
