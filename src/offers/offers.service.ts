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

  async getOffersList(
    search: string,
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
    categoryId?: number,
  ) {
    const offers = await this.offerRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        title: search ? Like(`%${search}%`) : undefined,
        categoryId,
      },
    });

    return offers.map((offer) => ({
      ...offer,
      photos: offer.photos ? offer.photos.split('|') : undefined,
    }));
  }

  getOffersTotal(search: string, categoryId?: number) {
    return this.offerRepository.count({
      where: {
        title: search ? Like(`%${search}%`) : undefined,
        categoryId,
      },
    });
  }
}
