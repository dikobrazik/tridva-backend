import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CategoryService} from 'src/category/category.service';
import {Category} from 'src/entities/Category';
import {Offer} from 'src/entities/Offer';
import {In, Like, Repository} from 'typeorm';

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

@Injectable()
export class OffersService {
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;

  @Inject(CategoryService)
  private categoryService: CategoryService;

  async getOffersList(
    search: string,
    page: number = DEFAULT_PAGE,
    pageSize: number = DEFAULT_PAGE_SIZE,
    categoryId?: number,
  ) {
    const childCategories = await this.categoryService.getCategoryChildrenIds(
      categoryId,
    );

    const offers = await this.offerRepository.find({
      skip: (page - 1) * pageSize,
      take: pageSize,
      where: {
        title: search ? Like(`%${search}%`) : undefined,
        categoryId: In(childCategories),
      },
    });

    return offers.map(this.prepareOffer);
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
    if (offer.photos) {
      return {
        ...offer,
        photos: offer.photos.split('|'),
      };
    }
    return offer;
  }

  async getOffersTotal(search?: string, categoryId?: number) {
    const childCategories = await this.categoryService.getCategoryChildrenIds(
      categoryId,
    );

    return this.offerRepository.count({
      where: {
        title: search ? Like(`%${search}%`) : undefined,
        categoryId: In(childCategories),
      },
    });
  }
}
