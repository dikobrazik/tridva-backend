import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {User} from './User';
import {Offer} from './Offer';
import {ReviewPhoto} from './ReviewPhoto';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, {cascade: true})
  @JoinColumn()
  author: User;

  @Column()
  text: string;

  @Column({type: 'int'})
  rating: number;

  @OneToMany(() => ReviewPhoto, (reviewPhoto) => reviewPhoto.reviewId, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  photos: ReviewPhoto[];

  @ManyToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: number;

  @Column()
  offerId: number;

  @CreateDateColumn()
  createdAt: Date;
}
