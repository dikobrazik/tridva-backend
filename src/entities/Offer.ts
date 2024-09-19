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
  simaid: number;

  @Column()
  sid: number;

  @Column()
  description: string;

  @Column({type: 'decimal', nullable: true})
  discount: number;

  @Column({nullable: true})
  photos?: string;

  @VirtualColumn({
    query: (alias) =>
      `SELECT * FROM "offer_photo" WHERE "offerId" = ${alias}.id`,
  })
  newPhotos: string[];

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
      `SELECT COUNT(*) FROM "group" WHERE "offerId" = ${alias}.id AND "capacity" > 1`,
  })
  groupsCount: number;

  @VirtualColumn({
    query: (alias) =>
      `SELECT AVG(rating) FROM "review" WHERE "offerId" = ${alias}.id`,
  })
  rating: number;
}
