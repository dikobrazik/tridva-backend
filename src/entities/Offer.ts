import {Column, Entity, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
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
  categoryId: number;
}
