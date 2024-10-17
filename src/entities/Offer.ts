import {
  Column,
  Entity,
  Index,
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

  @Index({unique: true})
  @Column()
  simaid: number;

  @Column()
  sid: number;

  @Column()
  description: string;

  @Column({type: 'decimal', nullable: true})
  discount: number;

  @Column({
    nullable: true,
    transformer: {
      to(photos: string[]) {
        return photos.join('|');
      },
      from(photos: string) {
        return photos.split('|');
      },
    },
  })
  photos?: string;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM "offer_photo" WHERE "offerId" = ${alias}.id`,
  })
  photosCount: number;

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
