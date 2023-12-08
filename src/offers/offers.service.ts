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
}
