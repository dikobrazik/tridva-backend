import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {Offer} from './Offer';
import {Attribute} from './Attribute';

@Entity()
export class OfferAttribute {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: Offer;

  @ManyToOne(() => Attribute)
  @JoinColumn({name: 'attributeId'})
  attribute: Attribute;

  @Column()
  offerId: number;

  @Column()
  attributeId: number;

  @Column()
  value: string;
}
