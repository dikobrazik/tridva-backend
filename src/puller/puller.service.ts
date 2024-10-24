import {Injectable} from '@nestjs/common';
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
} from './types';
import {Offer} from 'src/entities/Offer';
import {OfferAttribute} from 'src/entities/OfferAttribute';
import {Attribute} from 'src/entities/Attribute';
import {getRandomNumber} from 'src/shared/utils/getRandomNumber';
import {PullHistory} from 'src/entities/PullHistory';
import {OfferPhoto} from 'src/entities/OfferPhoto';
import {QueryDeepPartialEntity} from 'typeorm/query-builder/QueryPartialEntity';

interface ISimaApi {
  loadAttribute: (id: number) => Promise<SimaAttribute>;
  loadOption: (id: number) => Promise<SimaOption>;
  loadDataType: (id: number) => Promise<SimaDataType>;

  loadAttributes: (page: number) => Promise<SimaAttribute[]>;
  loadItemAttributes: (page: number) => Promise<SimaItemAttribute[]>;
  loadOffers: (page: number) => Promise<SimaOffer[]>;
  loadCategories: (page: number) => Promise<SimaCategory[]>;
  loadOffersCategories: (page: number) => Promise<SimaOfferCategory[]>;
}

class SimaApi implements ISimaApi {
  public loadOption: ISimaApi['loadOption'];
  public loadAttribute: ISimaApi['loadAttribute'];
  public loadDataType: ISimaApi['loadDataType'];

  public loadItemAttributes: ISimaApi['loadItemAttributes'];
  public loadAttributes: ISimaApi['loadAttributes'];
  public loadOffers: ISimaApi['loadOffers'];
  public loadCategories: ISimaApi['loadCategories'];
  public loadOffersCategories: ISimaApi['loadOffersCategories'];

  constructor() {
    this.loadAttribute = this.entityLoader<SimaAttribute>('attribute');
    this.loadOption = this.entityLoader<SimaAttribute>('option');
    this.loadDataType = this.entityLoader<SimaDataType>('data-type');

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

const MS_IN_DAY = 1000 * 60 * 60 * 24; // 1 day

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

  @InjectRepository(PullHistory)
  private pullHistoryRepository: Repository<PullHistory>;

  private simaApi: SimaApi;

  constructor(private configService: ConfigService) {
    this.simaApi = new SimaApi();
  }

  async pull() {
    axios.defaults.baseURL = this.configService.getOrThrow('SIMA_URL');

    if (this.isDev && !this.isDebug) return;

    await this.signIn();
    await this.fillCategories();
    await this.fillOffers();
    await this.fillAttributes();

    await this.pullHistoryRepository.update(
      {id: 1},
      {date: new Date().toDateString()},
    );
  }

  async signIn() {
    const token = await axios('/signin', {
      method: 'POST',
      data: {
        phone: this.configService.getOrThrow('SIMA_PHONE'),
        password: this.configService.getOrThrow('SIMA_PASS'),
        regulation: true,
      },
    }).then((r) => r.data.token);

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

  async fillAttributes() {
    const offerAttributesCount = await this.offerAttributeRepository.count();
    const hasBeenUpdatedMoreThanDayAgo =
      await this.getHasBeenUpdatedMoreThanDayAgo();
    if (offerAttributesCount && !this.isDebug && !hasBeenUpdatedMoreThanDayAgo)
      return;

    const iterations = this.isDebug ? 2 : Number.MAX_SAFE_INTEGER;

    for (let i = 1; i < iterations; i++) {
      const loadedOfferAttributes = await this.simaApi.loadItemAttributes(i);

      for (const offerAttribute of loadedOfferAttributes) {
        const offer = await this.offerRepository.findOne({
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
              value: attributeValue || 'Empty',
            },
            ['id', 'offerId', 'attributeId'],
          );
        }
      }
    }

    console.log('Attributes loading done!');
  }

  async fillOffers() {
    const offersCount = await this.offerRepository.count();
    const hasBeenUpdatedMoreThanDayAgo =
      await this.getHasBeenUpdatedMoreThanDayAgo();
    if (offersCount && !this.isDebug && !hasBeenUpdatedMoreThanDayAgo) return;

    const initialPages = [5000, 12343, 23002, 37213, 58922, 70932];

    for (const initialPage of initialPages) {
      const iterations = this.isDebug ? initialPage + 1 : initialPage + 3000;

      for (let i = initialPage; i < iterations; i++) {
        const offers = (await this.simaApi.loadOffers(i)).filter(
          (offer) =>
            offer.category_id &&
            // убираем товары без фоток
            offer.agg_photos &&
            offer.agg_photos.length &&
            // убираем товары для взрослых
            !offer.is_adult &&
            // убираем товары от внешних партнеров
            !offer.is_remote_store &&
            // убираем товары которых нет в наличии
            offer.balance === '0',
        );

        if (offers.length === 0) break;

        try {
          const {identifiers} = await this.offerRepository.upsert(
            offers.map((offer) => {
              const discount = getRandomNumber(10, 30);
              // цена = цена у поставщика + скидка
              const price = offer.price * (1 + discount / 100);

              const result = {
                simaid: offer.id,
                sid: offer.sid,
                title: offer.name,
                description: offer.description,
                discount,
                price,
                categoryId: offer.category_id,
                photos: null,
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
            offers.reduce((offersPhotos, offer, index) => {
              const offerPhotosUrls = offer.agg_photos.map(
                (index) => `${offer.base_photo_url}${index}`,
              );

              return offersPhotos.concat(
                offerPhotosUrls.map((url) => ({
                  offerId: identifiers[index].id,
                  photoUrl: url,
                })),
              );
            }, [] as QueryDeepPartialEntity<OfferPhoto>[]),
            ['offerId', 'photoUrl'],
          );
        } catch (e) {
          console.log(e);
          console.log('something went wrong while loading offers');
        }
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
