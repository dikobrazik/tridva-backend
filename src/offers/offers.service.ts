import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CategoryService} from 'src/category/category.service';
import {
  DEFAULT_PAGE_SIZE,
  getPaginationFields,
} from 'src/shared/utils/pagination';
import {Offer} from 'src/entities/Offer';
import {
  And,
  FindOptionsOrder,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import {LIST_OFFER_VIEW} from 'src/entity-views/offer';
import {SearchOffersDto} from './dto';
import {ORDER} from './constants';

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

  async getRandomOffersList({page, pageSize}: SearchOffersDto) {
    const {skip, take} = getPaginationFields(page, pageSize);
    const offers = await this.offerRepository
      .find({
        select: LIST_OFFER_VIEW,
        where: {
          id: In(this.randomOffersIds.slice(skip, skip + take)),
        },
      })
      .then((offers) =>
        this.randomOffersIds
          .slice(skip, skip + take)
          .map((id) => offers.find((offer) => offer.id === id)),
      );
    const count = this.randomOffersIds.length;

    return this.prepareOffersListResponse(offers, count, pageSize);
  }

  async getOffersListBySearch(
    search: string,
    {page, pageSize, priceFrom, priceTo, order}: SearchOffersDto,
  ) {
    const {skip, take} = getPaginationFields(page, pageSize);
    const qb = this.offerRepository
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
      .take(take);

    if (priceFrom) {
      qb.andWhere('offer.price >= :priceFrom', {priceFrom});
    }
    if (priceTo) {
      qb.andWhere('offer.price <= :priceTo', {priceTo});
    }

    if (order) {
      this.addOrderByToQueryBuilder(qb, order);
    }

    const [offers, count] = await qb.getManyAndCount();

    return this.prepareOffersListResponse(offers, count, pageSize);
  }

  async getOffersListByCategory(
    categoryId: string,
    {page, pageSize, priceFrom, priceTo, order}: SearchOffersDto,
  ) {
    const {skip, take} = getPaginationFields(page, pageSize);
    const [offers, count] = await this.offerRepository.findAndCount({
      select: LIST_OFFER_VIEW,
      where: {
        categoryId: In(await this.getCategoryIds(categoryId)),
        price: this.getPriceWhere(priceFrom, priceTo),
      },
      skip,
      take,
      order: order ? this.getRepositoryOrderBy(order) : undefined,
    });

    return this.prepareOffersListResponse(offers, count, pageSize);
  }

  private getPriceWhere(priceFrom?: number, priceTo?: number) {
    if (priceFrom && priceTo) {
      return And(MoreThanOrEqual(priceFrom), LessThanOrEqual(priceTo));
    }

    if (priceFrom) {
      return MoreThanOrEqual(priceFrom);
    }

    if (priceTo) {
      return LessThanOrEqual(priceTo);
    }

    return undefined;
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

  async getOfferById(offerId: Offer['id']): Promise<Offer | null> {
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

  private getRepositoryOrderBy(
    order: Values<typeof ORDER>,
  ): FindOptionsOrder<Offer> {
    switch (order) {
      case ORDER.POPULAR:
        return {ordersCount: 'DESC'};
      case ORDER.PRICE_ASC:
        return {price: 'ASC'};
      case ORDER.PRICE_DESC:
        return {price: 'DESC'};
      case ORDER.DISCOUNT:
        return {discount: 'DESC'};
      case ORDER.RATING:
        return {rating: 'DESC'};
    }
  }

  private addOrderByToQueryBuilder(
    qb: SelectQueryBuilder<Offer>,
    order: Values<typeof ORDER>,
  ) {
    switch (order) {
      case ORDER.POPULAR:
        qb.addOrderBy('offer.ordersCount', 'DESC');
        break;
      case ORDER.PRICE_ASC:
        qb.addOrderBy('offer.price', 'ASC');
        break;
      case ORDER.PRICE_DESC:
        qb.addOrderBy('offer.price', 'DESC');
        break;
      case ORDER.DISCOUNT:
        qb.addOrderBy('offer.discount', 'DESC');
        break;
      case ORDER.RATING:
        qb.addOrderBy('offer.rating', 'DESC');
        break;
    }
  }
}
