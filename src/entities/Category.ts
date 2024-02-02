import {Column, Entity, PrimaryColumn} from 'typeorm';

@Entity()
export class Category {
  @PrimaryColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  level: string;

  @Column({nullable: true})
  path: string;

  @Column({type: 'boolean', nullable: true})
  isLeaf: boolean;

  @Column({type: 'boolean', nullable: true})
  isAdult: boolean;

  @Column({nullable: true})
  icon: string;
}
