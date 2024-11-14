import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Modifier {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;
}
