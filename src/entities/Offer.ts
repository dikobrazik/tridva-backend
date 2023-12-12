import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({type: 'decimal'})
  cost: number;
}
