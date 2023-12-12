import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Offer} from 'src/entities/Offer';
import {Like, Repository} from 'typeorm';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

@Injectable()
export class OffersService {
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;

  getOffersList(
    search: string,
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
  ) {
    const where = search ? {title: Like(`%${search}%`)} : undefined;

    return this.offerRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where,
    });
  }

  seed() {
    return Promise.all([
      this.offerRepository.insert({
        title: 'Offer 1',
        description: 'Offer 1',
        cost: 100,
      }),
      this.offerRepository.insert({
        title: 'Offer 2',
        description: 'Offer 2',
        cost: 200,
      }),
      this.offerRepository.insert({
        title: 'Offer 3',
        description: 'Offer 3',
        cost: 300,
      }),
    ]);
  }
}
