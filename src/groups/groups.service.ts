import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {OrderStatus} from 'src/entities/enums';
import {Group} from 'src/entities/Group';
import {Order} from 'src/entities/Order';
import {OrderGroup} from 'src/entities/OrderGroup';
import {In, MoreThan, Not, Repository} from 'typeorm';

type OfferBestGroup = {
  id: number;
  leftCapacity: number;
  ownerName: string;
  createdAt: Date;
};

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

  public async getUserGroups(userId: number) {
    const userOrders = await this.orderGroupsRepository.find({
      select: {groupId: true},
      where: {status: OrderStatus.PAID, order: {userId}},
    });

    return this.groupRepository
      .find({
        where: {
          id: In(userOrders.map((order) => order.groupId)),
        },
        relations: {owner: {profile: true}},
      })
      .then(this.prepareGroups);
  }

  public getUserGroupsCount(userId: number): Promise<number> {
    return this.orderGroupsRepository.count({
      where: {status: OrderStatus.PAID, order: {userId}},
    });
  }

  public async getOfferGroup(
    offerId: number,
    userId: number,
  ): Promise<OfferBestGroup | null> {
    const userAssignedGroupsIds = await this.getUserAssignedGroupsIds(userId);

    return this.orderGroupsRepository
      .findOne({
        where: {
          status: OrderStatus.PAID,
          group: {
            id: Not(In(userAssignedGroupsIds)),
            offerId,
            ownerId: Not(userId),
          },
        },
        relations: {group: {owner: true, offer: true}},
      })
      .then((orderGroup) => {
        if (orderGroup) {
          const {group} = orderGroup;

          return {
            id: group.id,
            leftCapacity: group.capacity - group.participantsCount,
            offer: group.offer,
            ownerId: group.owner.id,
            ownerName: group.owner.profile.name,
            // по сути нужно брать время создания заказа
            // а лучше время оплаты заказа
            createdAt: group.createdAt,
          };
        }

        return null;
      });
  }

  public async getOfferGroups(offerId: number, userId: number) {
    return this.orderGroupsRepository
      .find({
        where: await this.getOfferGroupsWhere(offerId, userId),
        relations: {group: {owner: true, offer: true}},
      })
      .then((orderGroups) =>
        this.prepareGroups(orderGroups.map((orderGroup) => orderGroup.group)),
      );
  }

  public async getOfferGroupsCount(offerId: number, userId: number) {
    return this.orderGroupsRepository.count({
      where: await this.getOfferGroupsWhere(offerId, userId),
    });
  }

  private async getOfferGroupsWhere(offerId: number, userId: number) {
    return {
      status: OrderStatus.PAID,
      group: {
        id: Not(In(await this.getUserAssignedGroupsIds(userId))),
        ownerId: Not(userId),
        offer: {id: offerId},
        capacity: MoreThan(1),
      },
    };
  }

  private async getUserAssignedGroupsIds(userId: number) {
    const [userBasketGroupIds, userOrderGroupsIds] = await Promise.all([
      this.basketRepository
        .find({
          select: {groupId: true},
          where: {userId},
        })
        .then((userBasketItems) =>
          userBasketItems.map((basketItem) => basketItem.groupId),
        ),
      this.orderGroupsRepository
        .find({
          select: {groupId: true},
          where: {order: {userId}},
        })
        .then((userOrderGroups) =>
          userOrderGroups.map((orderGroup) => orderGroup.groupId),
        ),
    ]);

    return userBasketGroupIds.concat(userOrderGroupsIds);
  }

  private prepareGroups(groups: Group[]) {
    return groups.map(({owner, ...group}) => ({
      ...group,
      ownerId: owner.id,
      ownerName: owner.profile.name,
    }));
  }
}
