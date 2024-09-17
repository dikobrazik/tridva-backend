import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CategoryService} from 'src/category/category.service';
import {
  DEFAULT_PAGE_SIZE,
  getPaginationFields,
} from 'src/shared/utils/pagination';
import {Offer} from 'src/entities/Offer';
import {Repository} from 'typeorm';

@Injectable()
export class OffersService {
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;

  @Inject(CategoryService)
  private categoryService: CategoryService;

  async getRandomOffersList(
    search: string,
    page: number,
    pageSize: number,
    categoryId?: string,
  ) {
    const {skip, take} = getPaginationFields(page, pageSize);
    const queryBuilder = this.offerRepository
      .createQueryBuilder('offer')
      .select();

    if (search) {
      queryBuilder.where('offer.title ILIKE :title', {title: `%${search}%`});
    }

    if (categoryId) {
      const childCategories = await this.categoryService.getCategoryChildrenIds(
        Number(categoryId),
      );

      queryBuilder.andWhere('offer.categoryId IN(:...category)', {
        category: childCategories,
      });
    }

    if (!search && !categoryId) {
      queryBuilder.orderBy('RANDOM()');
    }

    const [offers, count] = await queryBuilder
      .addOrderBy('offer.photos')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return {
      offers: offers.map(this.prepareOffer),
      total: count,
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
}
