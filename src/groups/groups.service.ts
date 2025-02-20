import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {OrderStatus} from 'src/entities/enums';
import {Group} from 'src/entities/Group';
import {Order} from 'src/entities/Order';
import {OrderGroup} from 'src/entities/OrderGroup';
import {FindOptionsWhere, In, MoreThan, Not, Repository} from 'typeorm';
import {GroupMapper} from './mapper';
import {GroupModel, UserRelation} from './types';

@Injectable()
export class GroupsService {
  @InjectRepository(Group)
  private groupRepository: Repository<Group>;
  @InjectRepository(Order)
  private orderRepository: Repository<Order>;
  @InjectRepository(OrderGroup)
  private orderGroupsRepository: Repository<OrderGroup>;

  @InjectRepository(BasketItem)
  private basketRepository: Repository<BasketItem>;

  public async createGroup(offerId: number, userId: number): Promise<number> {
    const {
      identifiers: [{id: groupId}],
    } = await this.groupRepository.insert({
      capacity: 2,
      offer: {id: offerId},
      owner: {id: userId},
    });

    return groupId;
  }

  public async getUserGroups(userId: number): Promise<GroupModel[]> {
    const groupOrders = await this.orderGroupsRepository.find({
      select: {groupId: true},
      where: {status: OrderStatus.PAID, order: {userId}},
      order: {order: {createdAt: 'DESC'}},
      relations: {group: {owner: {profile: true}, offer: true}},
    });

    return groupOrders.map((groupOrder) =>
      new GroupMapper().mapGroupOrderEntityToModel(groupOrder, userId),
    );
  }

  public getUserGroupsCount(userId: number): Promise<number> {
    return this.orderGroupsRepository.count({
      where: {status: OrderStatus.PAID, order: {userId}},
    });
  }

  public getUserGroupOrderByGroupId(
    groupId: Group['id'],
    userId: number,
  ): Promise<OrderGroup> {
    return this.orderGroupsRepository.findOne({
      select: {id: true},
      where: {status: OrderStatus.PAID, groupId, order: {userId}},
    });
  }

  public async getOfferGroup(
    offerId: number,
    userId: number,
  ): Promise<GroupModel | null> {
    const userAssignedGroupsIds = await this.getUserAssignedGroupsIds(
      offerId,
      userId,
    );

    return this.orderGroupsRepository
      .findOne({
        where: {
          status: OrderStatus.PAID,
          group: {
            id: Not(In(userAssignedGroupsIds)),
            offerId,
            ownerId: Not(userId),
            participantsCount: 1,
          },
        },
        relations: {group: {owner: true, offer: true}},
      })
      .then((orderGroup) => {
        if (orderGroup) {
          return new GroupMapper().mapGroupOrderEntityToModel(
            orderGroup,
            userId,
          );
        }

        return null;
      });
  }

  public async getOfferGroups(
    offerId: number,
    userId: number,
  ): Promise<GroupModel[]> {
    return this.orderGroupsRepository
      .find({
        where: this.getOfferGroupsWhere(offerId),
        relations: {group: {owner: {profile: true}}},
        // dont load group offers
        loadEagerRelations: false,
      })
      .then((orderGroups) =>
        Promise.all(
          orderGroups.map(async (orderGroup) => {
            const groupModel = new GroupMapper().mapGroupOrderEntityToModel(
              orderGroup,
              userId,
            );

            groupModel.relation = await this.getUserRelation(
              offerId,
              orderGroup.group,
              userId,
            );

            return groupModel;
          }),
        ),
      );
  }

  public getOfferGroupsCount(offerId: number) {
    return this.orderGroupsRepository.count({
      where: this.getOfferGroupsWhere(offerId),
    });
  }

  private getOfferGroupsWhere(offerId: number): FindOptionsWhere<OrderGroup> {
    return {
      status: OrderStatus.PAID,
      group: {
        offer: {id: offerId},
        capacity: MoreThan(1),
        // TODO: переделать с группами вместимостью > 2 человек
        participantsCount: 1,
      },
    };
  }

  private async getUserAssignedGroupsIds(offerId: number, userId: number) {
    const [userBasketGroupIds, userOrderGroupsIds] = await Promise.all([
      this.getUserBasketGroupsIds(offerId, userId),
      this.getUserPaidGroupsIds(offerId, userId),
    ]);

    return userBasketGroupIds.concat(userOrderGroupsIds);
  }

  private getUserBasketGroupsIds(offerId: number, userId: number) {
    return this.basketRepository
      .find({
        select: {groupId: true},
        where: {userId, group: {offerId}},
      })
      .then((userBasketItems) =>
        userBasketItems.map((basketItem) => basketItem.groupId),
      );
  }

  private getUserPaidGroupsIds(offerId: number, userId: number) {
    return this.orderGroupsRepository
      .find({
        select: {groupId: true},
        where: {order: {userId}, group: {offerId}},
      })
      .then((userOrderGroups) =>
        userOrderGroups.map((orderGroup) => orderGroup.groupId),
      );
  }

  private async getUserRelation(offerId: number, group: Group, userId: number) {
    const [userBasketGroupIds, userOrderGroupsIds] = await Promise.all([
      this.getUserBasketGroupsIds(offerId, userId),
      this.getUserPaidGroupsIds(offerId, userId),
    ]);

    if (group.ownerId === userId) {
      return UserRelation.OWNER;
    } else if (userBasketGroupIds.includes(group.id)) {
      return UserRelation.BASKET;
    } else if (userOrderGroupsIds.includes(group.id)) {
      return UserRelation.PAID;
    } else {
      return UserRelation.NONE;
    }
  }
}
