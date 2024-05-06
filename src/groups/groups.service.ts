import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {Group} from 'src/entities/Group';
import {MoreThan, Raw, Repository} from 'typeorm';

@Injectable()
export class GroupsService {
  @InjectRepository(Group)
  private groupRepository: Repository<Group>;

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

  public getOfferGroups(offerId: number) {
    return this.groupRepository
      .find({
        where: {
          offer: {id: offerId},
          participantsCount: Raw((alias) => `${alias} < capacity`),
          capacity: MoreThan(1),
        },
        relations: {owner: {profile: true}},
      })
      .then((groups) =>
        groups.map(({owner, ...group}) => ({
          ...group,
          ownerId: owner.id,
          ownerName: owner.profile.name,
        })),
      );
  }
}
