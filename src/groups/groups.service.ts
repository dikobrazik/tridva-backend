import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Group} from 'src/entities/Group';
import {GroupParticipant} from 'src/entities/GroupParticipant';
import {Repository} from 'typeorm';

@Injectable()
export class GroupsService {
  @InjectRepository(GroupParticipant)
  private groupParticipantRepository: Repository<GroupParticipant>;

  @InjectRepository(Group)
  private groupRepository: Repository<Group>;

  public async createGroup(offerId: number, userId: number) {
    this.groupRepository.insert({
      offer: {id: offerId},
      owner: {id: userId},
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

    const participants = await this.groupParticipantRepository.find({
      where: {participant: {id: userId}},
    });

    if (participants.length > 0 || group.owner.id === userId) {
      throw new BadRequestException();
    }

    this.groupParticipantRepository.insert({
      group: {id: groupId},
      participant: {id: userId},
    });
  }

  public getOfferGroups(offerId: number) {
    return this.groupRepository.find({
      where: {offer: {id: offerId}},
    });
  }
}
