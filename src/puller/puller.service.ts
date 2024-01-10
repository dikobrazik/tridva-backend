import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import axios from 'axios';
import {Category} from 'src/entities/Category';
import {Repository} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import {SimaCategory, SimaOffer, SimaOfferCategory} from './types';
import {Offer} from 'src/entities/Offer';

@Injectable()
export class PullerService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;
  @InjectRepository(Offer)
  private offerRepository: Repository<Offer>;

  constructor(private configService: ConfigService) {}

  async pull() {
    axios.defaults.baseURL = this.configService.getOrThrow('SIMA_URL');

    await this.signIn();

    const isDev = this.configService.get('IS_DEV');

    if (!isDev) {
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
    const allCategories = [];

    for (let i = 1; ; i++) {
      const categories = (await axios(`/category?p=${i}`).then(
        (r) => r.data,
      )) as SimaCategory[];

      if (categories.length === 0) break;

      allCategories.push(
        ...categories.map((category) => ({
          id: category.id,
          name: category.name,
          level: category.level,
        })),
      );
    }

    await this.categoryRepository.upsert(allCategories, ['id']);
  }

  async fillOffers() {
    const offersCategories = await this.getOffersCategories();

    const allOffers: Offer[] = [];

    for (let i = 1; i < 1000; i++) {
      const offers = (await axios(`/item?p=${i}`).then(
        (r) => r.data,
      )) as SimaOffer[];

      if (offers.length === 0) break;

      allOffers.push(
        ...offers.map((offer) => ({
          id: offer.id,
          title: offer.name,
          description: offer.description,
          price: offer.price,
          categoryId: offersCategories[offer.id]
        })),
      );
    }

    await this.offerRepository.upsert(allOffers, ['id']);
  }

  async getOffersCategories() {
    const offersCategoriesMap: Record<string, number> = {};

    for (let i = 1; i < 2; i++) {
      const offerCategories = (await axios(`/item?p=${i}`).then(
        (r) => r.data,
      )) as SimaOfferCategory[];

      if (offerCategories.length === 0) break;

      for (const offerCategory of offerCategories) {
        offersCategoriesMap[offerCategory.item_id] = offerCategory.category_id;
      }
    }

    return offersCategoriesMap;
  }
}
