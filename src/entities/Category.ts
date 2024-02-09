import {Column, Entity, PrimaryColumn, VirtualColumn} from 'typeorm';

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

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM OFFER WHERE "categoryId" IN(SELECT category.id FROM category WHERE path LIKE ${alias}.id || '%')`,
  })
  offersCount: number;

  @Column({nullable: true})
  icon: string;
}
