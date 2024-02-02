import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Category} from 'src/entities/Category';
import {Like, Repository} from 'typeorm';

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

  async getCategoryChildrenIds(categoryId: Category['id']) {
    const categories = await this.categoryRepository.find({
      select: ['id'],
      where: {
        path: Like(`${categoryId}.%`),
      },
    });

    return categories.map((category) => category.id).concat(categoryId);
  }
}
