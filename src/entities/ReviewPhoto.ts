import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Review} from './Review';

@Entity()
export class ReviewPhoto {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  src: string;

  @ManyToOne(() => Review)
  @JoinColumn({name: 'reviewId'})
  review: Review;

  @Column()
  reviewId: number;
}
