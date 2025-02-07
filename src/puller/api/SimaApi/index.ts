/* eslint-disable no-console */
import {AxiosInstance} from 'axios';
import {
  SimaAttribute,
  SimaCategory,
  SimaDataType,
  SimaItemAttribute,
  SimaItemModifier,
  SimaModifier,
  SimaOffer,
  SimaOfferCategory,
  SimaOption,
} from './types';

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

export class SimaApi implements ISimaApi {
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

  constructor(private client: AxiosInstance) {
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
      // eslint-disable-next-line no-console
      if (page % 10000 === 0) console.log(`Loading ${entity} page ${page}...`);

      return this.client(`/${entity}?p=${page}`)
        .then((r) => r.data)
        .catch(() =>
          new Promise((r) => setTimeout(r, 10_000)).then(() => load(page)),
        );
    };

    return load;
  }

  private entityLoader<E>(entity: string) {
    const load = (id: number): Promise<E> => {
      return this.client(`/${entity}/${id}`)
        .then((r) => r.data)
        .catch(() =>
          new Promise((r) => setTimeout(r, 10_000)).then(() => load(id)),
        );
    };

    return load;
  }
}
