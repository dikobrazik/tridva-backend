import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Category} from 'src/entities/Category';
import {ILike, Like, Repository} from 'typeorm';

@Injectable()
export class CategoryService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;

  getPopularCategoriesList() {
    return Promise.all([
      this.categoryRepository.findOne({where: {level: '1', name: 'Посуда'}}),
      this.categoryRepository.findOne({where: {level: '1', name: 'Игрушки'}}),
      this.categoryRepository.findOne({
        where: {level: '1', name: 'Бытовая техника и электроника'},
      }),
      this.categoryRepository.findOne({where: {level: '1', name: 'Мебель'}}),
      this.categoryRepository.findOne({where: {level: '1', name: 'Хозтовары'}}),
      this.categoryRepository.findOne({
        where: {level: '1', name: 'Канцтовары'},
      }),
      this.categoryRepository.findOne({
        where: {level: '1', name: 'Творчество'},
      }),
      this.categoryRepository.findOne({
        where: {level: '4', name: 'Товары для красоты и здоровья'},
      }),
    ]);
  }

  getCategoriesList(level: number, name: string) {
    return this.categoryRepository.find({
      where: {
        level: level ? String(level) : undefined,
        name: name ? ILike(`%${name}%`) : undefined,
      },
      take: 30,
    });
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
