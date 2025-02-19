import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  VirtualColumn,
} from 'typeorm';
import {Category} from './Category';
import {OfferPhoto} from './OfferPhoto';

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

  @OneToOne(() => OfferPhoto, (offerPhoto) => offerPhoto.offer, {eager: true})
  photos?: OfferPhoto;

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
      `SELECT COUNT(*) FROM "group" WHERE "group"."offerId" = ${alias}.id AND "group"."capacity" > 1 AND (SELECT COUNT(*) FROM "order_group" WHERE "order_group"."groupId" = "group".id) > 0`,
  })
  groupsCount: number;

  @VirtualColumn({
    query: (alias) =>
      `SELECT AVG(rating) FROM "review" WHERE "offerId" = ${alias}.id`,
  })
  rating: number;

  @VirtualColumn({
    query: (alias) =>
      `select array_agg("group"."ownerId") from order_group join "group" on "group".id = order_group."groupId" where "group"."offerId" = ${alias}.id`,
  })
  groupsOwnersIds: number[];
}
