import {Group} from 'src/entities/Group';
import {OrderGroup} from 'src/entities/OrderGroup';
import {GroupModel, UserRelation} from './types';

export class GroupMapper {
  mapGroupOrderEntityToModel({group}: OrderGroup, userId: number): GroupModel {
    return this.mapGroupEntityToModel(group, userId);
  }

  mapGroupEntityToModel({owner, ...group}: Group, userId: number): GroupModel {
    return {
      ...group,
      relation: this.getUserRelation(group.ownerId, userId),
      ownerName: owner.profile.name,
    };
  }

  private getUserRelation(ownerId: number, userId: number) {
    return ownerId === userId ? UserRelation.OWNER : UserRelation.NONE;
  }
}
