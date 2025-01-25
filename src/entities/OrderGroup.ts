import {Column, Entity, JoinColumn, ManyToOne} from 'typeorm';
import {Group} from './Group';
import {OrderItem} from './OrderItem';

@Entity()
export class OrderGroup extends OrderItem {
  @ManyToOne(() => Group)
  @JoinColumn({name: 'groupId'})
  group: Group;

  @Column()
  groupId: number;
}
