import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import axios from 'axios';
import {Category} from 'src/entities/Category';
import {Repository} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import {
  SimaAttribute,
  SimaItemAttribute,
  SimaCategory,
  SimaOffer,
  SimaOfferCategory,
  SimaOption,
  SimaDataType,
  SimaItemModifier,
  SimaModifier,
} from './types';
import {Offer} from 'src/entities/Offer';
import {OfferAttribute} from 'src/entities/OfferAttribute';
import {Attribute} from 'src/entities/Attribute';
import {getRandomNumber} from 'src/shared/utils/getRandomNumber';
import {PullHistory} from 'src/entities/PullHistory';
import {OfferPhoto} from 'src/entities/OfferPhoto';
import {OffersService} from 'src/offers/offers.service';
import {CategoryService} from 'src/category/category.service';
import {Modifier} from 'src/entities/Modifier';
import {OfferModifier} from 'src/entities/OfferModifier';

interface ISimaApi {
  loadAttribute: (id: number) => Promise<SimaAttribute>;
  loadOption: (id: number) => Promise<SimaOption>;
  loadModifier: (id: number) => Promise<SimaModifier>;
  loadDataType: (id: number) => Promise<SimaDataType>;

  loadAttributes: (page: number) => Promise<SimaAttribute[]>;
  loadItemModifiers: (page: number) => Promise<SimaItemModifier[]>;
  loadItemAttributes: (page: number) => Promise<SimaItemAttribute[]>;
  loadOffers: (page: number) => Promise<SimaOffer[]>;
  loadCategories: (page: number) => Promise<SimaCategory[]>;
  loadOffersCategories: (page: number) => Promise<SimaOfferCategory[]>;
}

class SimaApi implements ISimaApi {
  public loadOption: ISimaApi['loadOption'];
  public loadModifier: ISimaApi['loadModifier'];
  public loadAttribute: ISimaApi['loadAttribute'];
  public loadDataType: ISimaApi['loadDataType'];

  public loadItemAttributes: ISimaApi['loadItemAttributes'];
  public loadItemModifiers: ISimaApi['loadItemModifiers'];
  public loadAttributes: ISimaApi['loadAttributes'];
  public loadOffers: ISimaApi['loadOffers'];
  public loadCategories: ISimaApi['loadCategories'];
  public loadOffersCategories: ISimaApi['loadOffersCategories'];

  constructor() {
    this.loadAttribute = this.entityLoader<SimaAttribute>('attribute');
    this.loadOption = this.entityLoader<SimaAttribute>('option');
    this.loadModifier = this.entityLoader<SimaModifier>('modifier');
    this.loadDataType = this.entityLoader<SimaDataType>('data-type');

    this.loadItemModifiers =
      this.entitiesLoader<SimaItemModifier>('item-modifier');
    this.loadAttributes = this.entitiesLoader<SimaAttribute>('attribute');
    this.loadItemAttributes =
      this.entitiesLoader<SimaItemAttribute>('item-attribute');
    this.loadOffers = this.entitiesLoader<SimaOffer>('item');
    this.loadCategories = this.entitiesLoader<SimaCategory>('category');
    this.loadOffersCategories =
      this.entitiesLoader<SimaOfferCategory>('item-category');
  }

  private entitiesLoader<E>(entity: string) {
    const load = (page: number): Promise<E[]> => {
      if (page % 10000 === 0) console.log(`Loading ${entity} page ${page}...`);

      return axios(`/${entity}?p=${page}`)
        .then((r) => r.data)
        .catch(() =>
          new Promise((r) => setTimeout(r, 10_000)).then(() => load(page)),
        );
    };

    return load;
  }

  private entityLoader<E>(entity: string) {
    const load = (id: number): Promise<E> => {
      return axios(`/${entity}/${id}`)
        .then((r) => r.data)
        .catch(() =>
          new Promise((r) => setTimeout(r, 10_000)).then(() => load(id)),
        );
    };

    return load;
  }
}

const MS_IN_DAY = 1000 * 60 * 60 * 24; // 1 day trigger 2

@Injectable()
export class PullerService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;
  @InjectRepository(OfferPhoto)
  private offerPhotoRepository: Repository<OfferPhoto>;
  @InjectRepository(OfferAttribute)
  private offerAttributeRepository: Repository<OfferAttribute>;
  @InjectRepository(Attribute)
  private attributeRepository: Repository<Attribute>;
  @InjectRepository(Modifier)
  private modifierRepository: Repository<Modifier>;
  @InjectRepository(OfferModifier)
  private offerModifierRepository: Repository<OfferModifier>;

  @InjectRepository(PullHistory)
  private pullHistoryRepository: Repository<PullHistory>;

  @Inject(OffersService)
  private offersService: OffersService;
  @Inject(CategoryService)
  private categoryService: CategoryService;

  private simaApi: SimaApi;

  private moreThanOneQuantityOffersCount = 0;

  constructor(private configService: ConfigService) {
    this.simaApi = new SimaApi();
  }

  private async functionWorkTimeLogger(fn: () => Promise<any>) {
    console.time(fn.name);
    console.log(`${fn.name} started...`);
    await fn();
    console.log(`${fn.name} ended...`);
    console.timeEnd(fn.name);
  }

  async pull() {
    axios.defaults.baseURL = this.configService.getOrThrow('SIMA_URL');

    if (this.isDev && !this.isDebug) return;

    await this.functionWorkTimeLogger(this.signIn.bind(this));
    await this.functionWorkTimeLogger(this.fillCategories.bind(this));
    await this.functionWorkTimeLogger(
      async function loadOffers() {
        await Promise.all(
          [5000, 15000, 25000, 35000, 45000, 55000, 65000, 75000].map(
            this.fillOffers.bind(this),
          ),
        );
      }.bind(this),
    );
    if (!this.isDebug) {
      await this.functionWorkTimeLogger(
        this.fillCategoriesOffersCount.bind(this),
      );
    }
    await this.functionWorkTimeLogger(this.fillAttributes.bind(this));
    await this.functionWorkTimeLogger(this.fillModifiers.bind(this));

    console.log(
      'moreThanOneQuantityOffersCount',
      this.moreThanOneQuantityOffersCount,
    );

    this.offersService.preloadRandomOffersIds().catch(console.log);
    this.categoryService.preparePopularCategoriesList().catch(console.log);

    if (!this.isDebug) {
      await this.pullHistoryRepository.update(
        {id: 1},
        {date: new Date().toDateString()},
      );
    }
  }

  async signIn() {
    const token = await axios('/signin', {
      method: 'POST',
      data: {
        phone: this.configService.getOrThrow('SIMA_PHONE'),
        password: this.configService.getOrThrow('SIMA_PASS'),
        regulation: true,
      },
    })
      .then((r) => r.data.token)
      .catch(console.log);

    axios.defaults.headers.Authorization = token;
  }

  async fillCategories() {
    const hasBeenUpdatedMoreThanDayAgo =
      await this.getHasBeenUpdatedMoreThanDayAgo();
    const categoriesCount = await this.categoryRepository.count();
    if (categoriesCount && !this.isDebug && !hasBeenUpdatedMoreThanDayAgo)
      return;

    const iterations = this.isDebug ? 2 : Number.MAX_SAFE_INTEGER;

    for (let i = 1; i < iterations; i++) {
      const categories = await this.simaApi.loadCategories(i);

      if (categories.length === 0) break;

      await this.categoryRepository.upsert(
        categories.map((category) => ({
          id: category.id,
          name: category.name,
          level: String(category.level),
          path: category.path,
          isAdult: category.is_adult,
          isLeaf: category.is_leaf,
          icon: category.icon,
        })),
        ['id'],
      );
    }
  }

  async fillCategoriesOffersCount() {
    const hasBeenUpdatedMoreThanDayAgo =
      await this.getHasBeenUpdatedMoreThanDayAgo();
    if (!this.isDebug && !hasBeenUpdatedMoreThanDayAgo) return;

    const levels = await this.categoryRepository
      .createQueryBuilder()
      .select('level')
      .orderBy('level', 'DESC')
      .groupBy('level')
      .getRawMany();

    await this.categoryRepository
      .createQueryBuilder()
      .update({offersCount: 0})
      .execute();

    for await (const {level} of levels) {
      const categories = await this.categoryRepository.find({
        where: {level: level},
      });

      for await (const category of categories) {
        const categoryOffersCount = await this.offerRepository.count({
          where: {categoryId: category.id},
        });

        await this.categoryRepository
          .createQueryBuilder()
          .whereInIds(category.path.split('.').map(Number))
          .update({
            offersCount: () => `offersCount + ${categoryOffersCount}`,
          })
          .execute();
      }
    }
  }

  async fillAttributes() {
    const offerAttributesCount = await this.offerAttributeRepository.count();
    const hasBeenUpdatedMoreThanDayAgo =
      await this.getHasBeenUpdatedMoreThanDayAgo();
    if (offerAttributesCount && !this.isDebug && !hasBeenUpdatedMoreThanDayAgo)
      return;

    const loadAttributesFromPage = async (startPage: number) => {
      const iterations = this.isDebug ? 2 : 100_000;

      for (let i = startPage; i < iterations; i++) {
        const loadedOfferAttributes = await this.simaApi.loadItemAttributes(i);

        if (loadedOfferAttributes.length === 0) break;

        for (const offerAttribute of loadedOfferAttributes) {
          const offer = await this.offerRepository.findOne({
            select: {id: true},
            where: {simaid: offerAttribute.item_id},
          });

          if (offer) {
            const attribute = await this.simaApi.loadAttribute(
              offerAttribute.attribute_id,
            );

            let attributeValue: string = '';

            if (attribute.data_type_id === 6) {
              attributeValue = await this.simaApi
                .loadOption(offerAttribute.option_value)
                .then((option) => option.name);
            } else {
              attributeValue = offerAttribute[attribute.data_type_id];
            }

            if (!attributeValue) {
              continue;
            }

            await this.attributeRepository.upsert(
              {
                id: attribute.id,
                name: attribute.name,
              },
              ['id'],
            );

            await this.offerAttributeRepository.upsert(
              {
                id: offerAttribute.id,
                offerId: offer.id,
                attributeId: offerAttribute.attribute_id,
                value: attributeValue,
              },
              ['id', 'offerId', 'attributeId'],
            );
          }
        }
      }
    };

    await Promise.all(
      [
        1, 100_000, 200_000, 300_000, 400_000, 500_000, 600_000, 700_000,
        800_000,
      ].map((startPage) => loadAttributesFromPage(startPage)),
    );
  }

  async fillModifiers() {
    const offerModifiersCount = await this.offerModifierRepository.count();
    const hasBeenUpdatedMoreThanDayAgo =
      await this.getHasBeenUpdatedMoreThanDayAgo();
    if (offerModifiersCount && !this.isDebug && !hasBeenUpdatedMoreThanDayAgo)
      return;

    await this.offerModifierRepository.clear();

    const iterations = this.isDebug ? 2 : 27000;

    for (let i = 0; i < iterations; i++) {
      const loadedOfferModifiers = await this.simaApi.loadItemModifiers(i);

      if (loadedOfferModifiers.length === 0) break;

      for (const offerModifier of loadedOfferModifiers) {
        const offer = await this.offerRepository.findOne({
          select: {id: true},
          where: {simaid: offerModifier.item_id},
        });

        if (offer) {
          const modifier = await this.simaApi.loadModifier(
            offerModifier.modifier_id,
          );

          await this.modifierRepository.upsert(
            {
              id: modifier.id,
              name: modifier.name,
            },
            ['id'],
          );

          await this.offerModifierRepository.insert({
            id: offerModifier.id,
            offerId: offer.id,
            modifierId: offerModifier.modifier_id,
            value: offerModifier.value,
          });
        }
      }
    }
  }

  async fillOffers(initialPage: number) {
    const offersCount = await this.offerRepository.count();
    const hasBeenUpdatedMoreThanDayAgo =
      await this.getHasBeenUpdatedMoreThanDayAgo();
    if (offersCount && !this.isDebug && !hasBeenUpdatedMoreThanDayAgo) return;

    const iterations = this.isDebug ? initialPage + 1 : initialPage + 5000;

    for (let i = initialPage; i < iterations; i++) {
      const rawOffers = await this.simaApi.loadOffers(i);

      const filteredOffers = rawOffers.filter((offer) => {
        const withCategory = offer.category_id;
        // убираем товары без фоток
        const withPhotos = offer.agg_photos && offer.agg_photos.length;
        // убираем товары для взрослых
        const isAdult = offer.is_adult;
        // убираем товары от внешних партнеров
        const isRemoteStore = offer.is_remote_store;
        // убираем товары которых нет в наличии
        const isExists = offer.balance !== '0';

        return (
          withCategory && withPhotos && !isAdult && !isRemoteStore && isExists
        );
      });

      if (rawOffers.length === 0) break;

      this.moreThanOneQuantityOffersCount += filteredOffers.filter(
        (offer) => offer.minimum_order_quantity > 1,
      ).length;

      try {
        const {identifiers} = await this.offerRepository.upsert(
          filteredOffers.map((offer) => {
            const discount = getRandomNumber(10, 30);
            // цена = цена у поставщика + скидка
            const price = offer.price * (1 + discount / 100);

            const result = {
              simaid: offer.id,
              sid: offer.sid,
              title: offer.name,
              balance: offer.balance,
              description: offer.description,
              discount,
              price,
              categoryId: offer.category_id,
              photos: null,
              ordersCount: getRandomNumber(100, 300),
            };

            if (offer.agg_photos?.length) {
              result.photos = offer.agg_photos.map(
                (index) => `${offer.base_photo_url}${index}`,
              );
            }

            return result;
          }),
          ['simaid'],
        );

        await this.offerPhotoRepository.upsert(
          filteredOffers.map((offer, index) => ({
            offerId: identifiers[index].id,
            photoBaseUrl: offer.base_photo_url,
            photosCount: offer.agg_photos?.length || 0,
          })),
          ['offerId'],
        );
      } catch (e) {
        console.log(e);
        console.log('something went wrong while loading offers');
      }
    }
  }

  async getOffersCategories() {
    const offersCategoriesMap: Record<string, number> = {};

    const iterations = this.isDebug ? 100 : Number.MAX_SAFE_INTEGER;

    for (let i = 1; i < iterations; i++) {
      const offerCategories = await this.simaApi.loadOffersCategories(i);

      if (offerCategories.length === 0) break;

      for (const offerCategory of offerCategories) {
        offersCategoriesMap[offerCategory.item_id] = offerCategory.category_id;
      }
    }

    return offersCategoriesMap;
  }

  private getHasBeenUpdatedMoreThanDayAgo() {
    return this.pullHistoryRepository
      .findOne({
        where: {id: 1},
      })
      .then(
        ({updatedAt}) =>
          new Date().valueOf() - new Date(updatedAt).valueOf() > MS_IN_DAY,
      );
  }

  private get isDebug() {
    return this.configService.get('DEBUG_PULLER') === 'true';
  }

  private get isDev() {
    return this.configService.get('IS_DEV') === 'true';
  }
}
