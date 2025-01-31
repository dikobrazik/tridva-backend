import {Group} from 'src/entities/Group';

export enum UserRelation {
  NONE = 'NONE',
  PAID = 'PAID',
  BASKET = 'BASKET',
  OWNER = 'OWNER',
}

export type GroupModel = Omit<Group, 'owner'> & {
  ownerName: string;
  relation: UserRelation;
};
