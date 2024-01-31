import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import axios from 'axios';
import {Category} from 'src/entities/Category';
import {Repository} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import {SimaCategory, SimaOffer, SimaOfferCategory} from './types';
import {Offer} from 'src/entities/Offer';

interface ISimaApi {
  loadOffers: (page: number) => Promise<SimaOffer[]>;
  loadCategories: (page: number) => Promise<SimaCategory[]>;
  loadOffersCategories: (page: number) => Promise<SimaOfferCategory[]>;
}

class SimaApi implements ISimaApi {
  public loadOffers: ISimaApi['loadOffers'];
  public loadCategories: ISimaApi['loadCategories'];
  public loadOffersCategories: ISimaApi['loadOffersCategories'];

  constructor() {
    this.loadOffers = this.loader<SimaOffer>('item');
    this.loadCategories = this.loader<SimaCategory>('category');
    this.loadOffersCategories = this.loader<SimaOfferCategory>('item-category');
  }

  private loader<E>(entity: string) {
    const load = (page: number): Promise<E[]> => {
      if (page % 10 === 0) console.log(`Loading ${entity} page ${page}...`);

      return axios(`/${entity}?p=${page}`)
        .then((r) => r.data)
        .catch(() =>
          new Promise((r) => setTimeout(r, 10_000)).then(() => load(page)),
        );
    };

    return load;
  }
}

@Injectable()
export class PullerService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;

  private simaApi: SimaApi;

  constructor(private configService: ConfigService) {
    this.simaApi = new SimaApi();
  }

  async pull() {
    axios.defaults.baseURL = this.configService.getOrThrow('SIMA_URL');

    await this.signIn();

    const isDev = this.configService.get('IS_DEV');
    const isDebug = this.configService.get('DEBUG_PULLER');

    if (!isDev || isDebug) {
      this.fillCategories();
      this.fillOffers();
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
    }).then((r) => r.data.token);

    axios.defaults.headers.Authorization = token;
  }

  async fillCategories() {
    const isDebug = this.configService.get('DEBUG_PULLER');

    if ((await this.categoryRepository.find()).length && !isDebug) return;

    const iterations = isDebug ? 2 : Number.MAX_SAFE_INTEGER;

    for (let i = 1; i < iterations; i++) {
      const categories = await this.simaApi.loadCategories(i);

      if (categories.length === 0) break;

      await this.categoryRepository.upsert(
        categories.map((category) => ({
          id: category.id,
          name: category.name,
          level: String(category.level),
        })),
        ['id'],
      );
    }
  }

  async fillOffers() {
    const isDebug = this.configService.get('DEBUG_PULLER');

    if ((await this.offerRepository.find()).length && !isDebug) return;

    const initialPage = 12343;
    const iterations = isDebug ? initialPage + 1 : initialPage + 50;

    const offersCategories = await this.getOffersCategories();

    for (let i = initialPage; i < iterations; i++) {
      const offers = await this.simaApi.loadOffers(i);

      if (offers.length === 0) break;

      await this.offerRepository.upsert(
        offers
          .filter((offer) => Boolean(offersCategories[offer.id]))
          .map((offer) => {
            const result = {
              id: offer.id,
              title: offer.name,
              description: offer.description,
              price: offer.price,
              categoryId: offersCategories[offer.id],
              photos: null,
            };

            if (offer.agg_photos?.length) {
              result.photos = offer.agg_photos
                .map((index) => `${offer.base_photo_url}${index}`)
                .join('|');
            }

            return result;
          }),
        ['id'],
      );
    }
  }

  async getOffersCategories() {
    const offersCategoriesMap: Record<string, number> = {};

    const isDebug = this.configService.get('DEBUG_PULLER');

    const iterations = isDebug ? 2 : Number.MAX_SAFE_INTEGER;

    for (let i = 1; i < iterations; i++) {
      const offerCategories = await this.simaApi.loadOffersCategories(i);

      if (offerCategories.length === 0) break;

      for (const offerCategory of offerCategories) {
        offersCategoriesMap[offerCategory.item_id] = offerCategory.category_id;
      }
    }

    return offersCategoriesMap;
  }
}
