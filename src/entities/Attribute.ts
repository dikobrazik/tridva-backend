import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Attribute {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}
