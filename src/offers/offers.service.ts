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

  private randomOffersIds: number[] = [];

  async preloadRandomOffersIds() {
    this.randomOffersIds = await this.offerRepository
      .createQueryBuilder('offer')
      .orderBy('RANDOM()')
      .select('offer.id')
      .limit(30_000)
      .getMany()
      .then((offers) => offers.map((offer) => offer.id));
  }

  async getRandomOffersList(page: number, pageSize: number) {
    const {skip, take} = getPaginationFields(page, pageSize);
    const offers = await this.offerRepository
      .find({
        where: {id: In(this.randomOffersIds.slice(skip, skip + take))},
      })
      .then((offers) =>
        this.randomOffersIds
          .slice(skip, skip + take)
          .map((id) => offers.find((offer) => offer.id === id)),
      );
    const count = this.randomOffersIds.length;

    return this.prepareOffersListResponse(offers, count, pageSize);
  }

  async getOffersListBySearch(search: string, page: number, pageSize: number) {
    return this.loadOffers(this.getSearchWhere(search), page, pageSize);
  }

  async getOffersListByCategory(
    categoryId: string,
    page: number,
    pageSize: number,
  ) {
    return this.loadOffers(
      await this.getCategoryWhere(categoryId),
      page,
      pageSize,
    );
  }

  private async loadOffers(
    where: FindOptionsWhere<Offer> | FindOptionsWhere<Offer>[],
    page: number,
    pageSize: number,
  ) {
    const {skip, take} = getPaginationFields(page, pageSize);
    const [offers, count] = await this.offerRepository.findAndCount({
      where,
      skip,
      take,
    });

    return this.prepareOffersListResponse(offers, count, pageSize);
  }

  private prepareOffersListResponse(
    offers: Offer[],
    count: number,
    pageSize: number,
  ) {
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

    return offer;
  }

  private prepareOffer(offer: Offer) {
    if (offer) {
      return {
        ...offer,
        description: undefined,
      };
    }
    return offer;
  }

  private async getCategoryWhere(
    categoryId?: string,
  ): Promise<FindOptionsWhere<Offer>> | undefined {
    if (categoryId) {
      const childCategories = await this.categoryService.getCategoryChildrenIds(
        Number(categoryId),
      );

      return {categoryId: In(childCategories)};
    }

    return undefined;
  }

  private getSearchWhere(
    search?: string,
  ): FindOptionsWhere<Offer>[] | undefined {
    if (search) {
      const splittedSearch = search.split(' ');

      return splittedSearch.map((searchSubString) => ({
        title: ILike(`%${searchSubString}%`),
        description: ILike(`%${searchSubString}%`),
      }));
    }

    return undefined;
  }
}
