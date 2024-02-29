import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {BasketItem} from 'src/entities/BasketItem';
import {Group} from 'src/entities/Group';
import {GroupParticipant} from 'src/entities/GroupParticipant';
import {MoreThan, Raw, Repository} from 'typeorm';

@Injectable()
export class GroupsService {
  @InjectRepository(GroupParticipant)
  private groupParticipantRepository: Repository<GroupParticipant>;

  @InjectRepository(Group)
  private groupRepository: Repository<Group>;

  @InjectRepository(BasketItem)
  private basketRepository: Repository<BasketItem>;

  public async createGroup(offerId: number, userId: number) {
    await this.groupRepository.insert({
      capacity: 2,
      offer: {id: offerId},
      owner: {id: userId},
    });
  }

  public async createSingleGroup(offerId: number, userId: number) {
    const group = await this.groupRepository.insert({
      capacity: 1,
      offer: {id: offerId},
      owner: {id: userId},
    });
    const groupId = group.identifiers[0].id;
    await this.basketRepository.insert({
      user: {id: userId},
      group: {id: groupId},
    });
  }

  public async joinGroup(groupId: number, userId: number) {
    const group = await this.groupRepository.findOne({
      where: {id: groupId},
      relations: {owner: true},
    });

    if (!group) {
      throw new NotFoundException();
    }

    const userAlreadyParticipating =
      await this.groupParticipantRepository.findOne({
        where: {participant: {id: userId}, group: {id: groupId}},
      });

    if (Boolean(userAlreadyParticipating) || group.owner.id === userId) {
      throw new BadRequestException();
    }

    this.groupParticipantRepository.insert({
      group: {id: groupId},
      participant: {id: userId},
    });
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
