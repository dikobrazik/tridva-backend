import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CategoryService} from 'src/category/category.service';
import {
  DEFAULT_PAGE_SIZE,
  getPaginationFields,
} from 'src/shared/utils/pagination';
import {Offer} from 'src/entities/Offer';
import {FindOptionsWhere, ILike, In, Repository} from 'typeorm';

@Injectable()
export class OffersService {
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;

  @Inject(CategoryService)
  private categoryService: CategoryService;

  async getOffersList(
    search: string,
    page: number,
    pageSize: number,
    categoryId?: string,
  ) {
    const [offers, count] = await this.offerRepository.findAndCount({
      ...getPaginationFields(page, pageSize),
      where: await this.getOffersListWhere(search, categoryId),
      order: {photos: 'ASC'},
    });

    return {
      offers: offers.map(this.prepareOffer),
      pagesCount: Math.ceil(count / (pageSize ?? DEFAULT_PAGE_SIZE)),
    };
  }

  async getOfferById(offerId: Offer['id']) {
    const offer = await this.offerRepository.findOne({
      where: {
        id: offerId,
      },
    });

    return this.prepareOffer(offer);
  }

  private prepareOffer(offer: Offer) {
    if (offer && offer.photos) {
      return {
        ...offer,
        photos: offer.photos.split('|'),
      };
    }
    return offer;
  }

  async getOffersTotal(search?: string, categoryId?: string) {
    return this.offerRepository.count({
      where: await this.getOffersListWhere(search, categoryId),
    });
  }

  private async getOffersListWhere(search?: string, categoryId?: string) {
    const where: FindOptionsWhere<Offer> = {};

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    if (categoryId) {
      const childCategories = await this.categoryService.getCategoryChildrenIds(
        Number(categoryId),
      );

      where.categoryId = In(childCategories);
    }

    return where;
  }
}
