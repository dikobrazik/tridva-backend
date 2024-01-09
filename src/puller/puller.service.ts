import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import axios from 'axios';
import {Category} from 'src/entities/Category';
import {Repository} from 'typeorm';
import {ConfigService} from '@nestjs/config';
import {SimaCategory} from './types';

@Injectable()
export class PullerService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;

  constructor(private configService: ConfigService) {}

  async pull() {
    axios.defaults.baseURL = this.configService.getOrThrow('SIMA_URL');

    await this.signIn();

    const isDev = this.configService.getOrThrow('SIMA_PHONE');

    if (!isDev) {
        this.fillCategories();
    }
  }

  async signIn() {
    const token = await axios('/signin', {
        method: 'POST',
        data: {
            phone: this.configService.getOrThrow('SIMA_PHONE'),
            password: this.configService.getOrThrow('SIMA_PASS')
          , "regulation": true},
    }).then(r => r.data.token);

    axios.defaults.headers.Authorization = token;
  }

  async fillCategories() {
    const allCategories = [];

    for (let i = 1; ; i++) {
        const categories = await axios(`/category?p=${i}`).then(r => r.data) as SimaCategory[];

        if (categories.length === 0) break;

        allCategories.push(categories.map((category) => ({
            id: category.id,
            name: category.name,
            level: category.level,
        })))
    }

    await this.categoryRepository.clear();
    await this.categoryRepository.insert(allCategories)
  }
}
