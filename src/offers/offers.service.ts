import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CategoryService} from 'src/category/category.service';
import {
  DEFAULT_PAGE_SIZE,
  getPaginationFields,
} from 'src/shared/utils/pagination';
import {Offer} from 'src/entities/Offer';
import {In, Repository} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import {LIST_OFFER_VIEW} from 'src/entity-views/offer';

@Injectable()
export class OffersService {
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;
  @Inject(CategoryService)
  private categoryService: CategoryService;
  @Inject(ConfigService)
  private configService: ConfigService;

  private randomOffersIds: number[] = [];

  async preloadRandomOffersIds() {
    const isDev = this.configService.get('IS_DEV') === 'true';

    this.randomOffersIds = await this.offerRepository
      .createQueryBuilder('offer')
      .orderBy('RANDOM()')
      .select('offer.id')
      .limit(isDev ? 500 : 30_000)
      .getMany()
      .then((offers) => offers.map((offer) => offer.id));
  }

  async getRandomOffersList(page: number, pageSize: number) {
    const {skip, take} = getPaginationFields(page, pageSize);
    const offers = await this.offerRepository
      .find({
        select: LIST_OFFER_VIEW,
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
    const {skip, take} = getPaginationFields(page, pageSize);
    const [offers, count] = await this.offerRepository
      .createQueryBuilder('offer')
      .select(
        Object.keys(LIST_OFFER_VIEW).map((fieldName) => `offer.${fieldName}`),
      )
      .where(
        `to_tsvector('russian', offer.title || ' ' || offer.description) @@ to_tsquery('russian', '${search
          .split(' ')
          .join(' & ')}')`,
      )
      .leftJoinAndSelect('offer.photos', 'offer_photo')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return this.prepareOffersListResponse(offers, count, pageSize);
  }

  async getOffersListByCategory(
    categoryId: string,
    page: number,
    pageSize: number,
  ) {
    const {skip, take} = getPaginationFields(page, pageSize);
    const [offers, count] = await this.offerRepository.findAndCount({
      select: LIST_OFFER_VIEW,
      where: {
        categoryId: In(await this.getCategoryIds(categoryId)),
      },
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

  private async getCategoryIds(
    categoryId?: string,
  ): Promise<number[]> | undefined {
    if (categoryId) {
      const childCategories = await this.categoryService.getCategoryChildrenIds(
        Number(categoryId),
      );

      return childCategories;
    }

    return undefined;
  }
}
