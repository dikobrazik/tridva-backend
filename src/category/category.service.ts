import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Category} from 'src/entities/Category';
import {Repository} from 'typeorm';

@Injectable()
export class CategoryService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;

  getCategoriesList(level: number) {
    return this.categoryRepository.find({where: {level: String(level)}});
  }

  getCategoryById(categoryId: number) {
    return this.categoryRepository.findOne({where: {id: Number(categoryId)}});
  }
}
