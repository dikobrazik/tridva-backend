import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Category {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  level: string;
}
