import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {Offer} from './Offer';
import {Attribute} from './Attribute';

@Entity()
export class OfferAttribute {
  @PrimaryColumn()
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
