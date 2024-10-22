import {Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({unique: true})
  @Column()
  name: string;
}
