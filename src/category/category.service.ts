import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Category} from 'src/entities/Category';
import {Repository} from 'typeorm';

@Injectable()
export class CategoryService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;

  getCategoriesList() {
    return this.categoryRepository.find();
  }
}
