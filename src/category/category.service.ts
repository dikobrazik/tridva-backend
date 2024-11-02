import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Category} from 'src/entities/Category';
import {ILike, In, Like, Repository} from 'typeorm';

@Injectable()
export class CategoryService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;

  private categoryChildrenIds: Record<number, number[]> = {};

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

  async getCategoryAncestors(categoryId: number): Promise<Category[]> {
    const category = await this.categoryRepository.findOne({
      where: {id: Number(categoryId)},
    });

    const categoryAncestorsIds = category.path.split('.').slice(0, -1);

    if (categoryAncestorsIds.length > 1) {
      return this.categoryRepository
        .find({
          where: {id: In(categoryAncestorsIds)},
        })
        .then((ancestorCategories) =>
          categoryAncestorsIds.map((id) =>
            ancestorCategories.find((category) => String(category.id) === id),
          ),
        );
    }

    return [];
  }

  async getCategoryChildrenIds(categoryId: Category['id']) {
    if (this.categoryChildrenIds[categoryId])
      return this.categoryChildrenIds[categoryId].slice();

    const categories = await this.categoryRepository.find({
      select: ['id'],
      where: [
        {
          path: Like(`${categoryId}.%`),
        },
        {
          path: Like(`%.${categoryId}.%`),
        },
      ],
    });

    this.categoryChildrenIds[categoryId] = categories
      .map((category) => category.id)
      .concat(categoryId);

    return this.categoryChildrenIds[categoryId].slice();
  }
}
