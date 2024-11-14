import {Column, Entity, JoinColumn, ManyToOne, PrimaryColumn} from 'typeorm';
import {Offer} from './Offer';
import {Modifier} from './Modifier';

@Entity()
export class OfferModifier {
  @PrimaryColumn()
  id: number;

  @ManyToOne(() => Offer)
  @JoinColumn({name: 'offerId'})
  offer: Offer;

  @Column()
  offerId: number;

  @ManyToOne(() => Modifier)
  @JoinColumn({name: 'modifierId'})
  modifier: Modifier;

  @Column()
  modifierId: number;

  @Column()
  value: string;
}
