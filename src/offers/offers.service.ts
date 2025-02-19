import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {CategoryService} from 'src/category/category.service';
import {
  DEFAULT_PAGE_SIZE,
  getPaginationFields,
} from 'src/shared/utils/pagination';
import {Offer} from 'src/entities/Offer';
import {And, In, LessThanOrEqual, MoreThanOrEqual, Repository} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import {LIST_OFFER_VIEW} from 'src/entity-views/offer';
import {SearchOffersDto} from './dto';
import {SORT} from './constants';

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
    {page, pageSize, priceFrom, priceTo, order: sort}: SearchOffersDto,
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

    if (sort) {
      const order = this.getOrderForSort(sort);

      qb.orderBy(order);
    }

    const [offers, count] = await qb.getManyAndCount();

    return this.prepareOffersListResponse(offers, count, pageSize);
  }

  async getOffersListByCategory(
    categoryId: string,
    {page, pageSize, priceFrom, priceTo, order: sort}: SearchOffersDto,
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
      order: sort ? this.getOrderForSort(sort) : undefined,
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
      offers: offers.map(({description, groupsOwnersIds, ...offer}) => ({
        ...offer,
        groupsOwnersIds: (groupsOwnersIds ?? []).slice(0, 3),
      })),
      total: count,
      pagesCount: Math.ceil(count / (pageSize ?? DEFAULT_PAGE_SIZE)),
    };
  }

  async getOfferById(offerId: Offer['id']): Promise<Offer | null> {
    return this.offerRepository.findOne({
      where: {
        id: offerId,
      },
    });
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

  private getOrderForSort(sort: Values<typeof SORT>): {
    [Key in keyof Offer]?: 'ASC' | 'DESC';
  } {
    switch (sort) {
      case SORT.POPULAR:
        return {ordersCount: 'DESC'};
      case SORT.PRICE_ASC:
        return {price: 'ASC'};
      case SORT.PRICE_DESC:
        return {price: 'DESC'};
      case SORT.DISCOUNT:
        return {discount: 'DESC'};
      case SORT.RATING:
        return {rating: 'DESC'};
    }
  }
}
