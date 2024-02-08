import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';
import {Category} from './Category';

@Entity()
export class Offer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({nullable: true})
  photos?: string;

  @Column({type: 'decimal'})
  price: number;

  @ManyToOne(() => Category)
  @JoinColumn({name: 'categoryId'})
  category: Category;

  @Column()
  categoryId: number;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM "review" WHERE "offerId" = ${alias}.id`,
  })
  reviewsCount: number;

  @VirtualColumn({
    query: (alias) =>
      `SELECT AVG(rating) FROM "review" WHERE "offerId" = ${alias}.id`,
  })
  rating: number;
}
