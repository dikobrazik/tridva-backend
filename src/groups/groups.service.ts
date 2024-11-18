import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {Group} from 'src/entities/Group';
import {Order} from 'src/entities/Order';
import {In, IsNull, MoreThan, Not, Raw, Repository} from 'typeorm';

@Injectable()
export class GroupsService {
  @InjectRepository(Group)
  private groupRepository: Repository<Group>;
  @InjectRepository(Order)
  private orderRepository: Repository<Order>;

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

  public async getUserGroups(userId: number): Promise<Group[]> {
    const orders = await this.orderRepository.find({
      select: {groupId: true},
      where: {groupId: Not(IsNull()), userId},
    });

    return this.groupRepository
      .find({
        where: {
          id: In(orders.map((order) => order.groupId)),
        },
        relations: {owner: {profile: true}, orders: true},
      })
      .then(this.prepareGroups);
  }

  public getOfferGroups(offerId: number) {
    return this.groupRepository
      .find({
        where: {
          offer: {id: offerId},
          participantsCount: Raw(
            (alias) => `${alias} < capacity AND ${alias} >= 1`,
          ),
          capacity: MoreThan(1),
        },
        relations: {owner: {profile: true}, orders: true},
      })
      .then(this.prepareGroups);
  }

  private prepareGroups(groups) {
    return groups.map(({owner, ...group}) => ({
      ...group,
      ownerId: owner.id,
      ownerName: owner.profile.name,
    }));
  }
}
