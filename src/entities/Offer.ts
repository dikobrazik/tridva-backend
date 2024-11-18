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

  @Column()
  balance: string;

  @Column({type: 'decimal', nullable: true})
  discount: number;

  @Column({
    nullable: true,
    transformer: {
      to(photos: string[]) {
        return photos.join('|');
      },
      from(photos: string) {
        if (photos) {
          return photos.split('|');
        }
        return photos;
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

  @Column({type: 'int', nullable: true})
  ordersCount: number;

  @Column({type: 'int', nullable: true})
  minOrderQty: number;

  @Column({type: 'int', nullable: true})
  qtyMultiplier: number;

  @ManyToOne(() => Category)
  @JoinColumn({name: 'categoryId'})
  category: Category;

  @Index()
  @Column()
  categoryId: number;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM "review" WHERE "offerId" = ${alias}.id AND text != ''`,
  })
  reviewsCount: number;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM "review" WHERE "offerId" = ${alias}.id`,
  })
  ratingsCount: number;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM "group" WHERE "offerId" = ${alias}.id AND "capacity" > 1 AND (SELECT COUNT(*) FROM "order" WHERE "order"."groupId" = "group".id) > 0`,
  })
  groupsCount: number;

  @VirtualColumn({
    query: (alias) =>
      `SELECT AVG(rating) FROM "review" WHERE "offerId" = ${alias}.id`,
  })
  rating: number;
}
