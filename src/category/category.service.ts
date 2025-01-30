import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Category} from 'src/entities/Category';
import {In, Like, MoreThan, Repository} from 'typeorm';
import {buildPathForChildren} from './utils';

const SHORT_CATEGORY = {id: true, name: true};

@Injectable()
export class CategoryService {
  @InjectRepository(Category)
  private categoryRepository: Repository<Category>;

  private categoryChildrenIds: Record<number, number[]> = {};

  private popularCategoriesList: Category[] = [];

  async preparePopularCategoriesList() {
    await Promise.all([
      this.categoryRepository.findOne({
        select: SHORT_CATEGORY,
        where: {level: 1, name: 'Посуда'},
      }),
      this.categoryRepository.findOne({
        select: SHORT_CATEGORY,
        where: {offersCount: MoreThan(0), level: 1, name: 'Игрушки'},
      }),
      this.categoryRepository.findOne({
        select: SHORT_CATEGORY,
        where: {
          offersCount: MoreThan(0),
          level: 1,
          name: 'Бытовая техника и электроника',
        },
      }),
      this.categoryRepository.findOne({
        select: SHORT_CATEGORY,
        where: {offersCount: MoreThan(0), level: 1, name: 'Мебель'},
      }),
      this.categoryRepository.findOne({
        select: SHORT_CATEGORY,
        where: {offersCount: MoreThan(0), level: 1, name: 'Хозтовары'},
      }),
      this.categoryRepository.findOne({
        select: SHORT_CATEGORY,
        where: {offersCount: MoreThan(0), level: 1, name: 'Канцтовары'},
      }),
      this.categoryRepository.findOne({
        select: SHORT_CATEGORY,
        where: {offersCount: MoreThan(0), level: 1, name: 'Творчество'},
      }),
      this.categoryRepository.findOne({
        select: SHORT_CATEGORY,
        where: {
          offersCount: MoreThan(0),
          level: 4,
          name: 'Товары для красоты и здоровья',
        },
      }),
    ]).then((popularCategoriesList) => {
      this.popularCategoriesList = popularCategoriesList.filter(Boolean);
    });
  }

  getPopularCategoriesList() {
    return this.popularCategoriesList;
  }

  getCategoriesList(level: number, name: string, parentId: number) {
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    queryBuilder.select().addSelect(
      (qb) =>
        qb
          .subQuery()
          .select('count(*)')
          .from(Category, 'sub_category')
          .where(
            `path like '${buildPathForChildren(
              `' || category.id || '`,
              level + 1,
            )}'`,
          ),
      'category_childrenCount',
    );

    queryBuilder.where({offersCount: MoreThan(1)});

    if (level) {
      queryBuilder.andWhere('level = :level', {level});
    }

    if (parentId) {
      queryBuilder.andWhere(
        `path like '${buildPathForChildren(parentId, level)}'`,
      );
    }

    if (name) {
      queryBuilder.andWhere(
        `to_tsvector('russian', name) @@ to_tsquery('russian', '${name
          .split(' ')
          .join(' & ')}')`,
      );
    }

    queryBuilder.take(30);

    return queryBuilder.getMany();
  }

  getCategoryById(categoryId: number) {
    return this.categoryRepository.findOne({where: {id: Number(categoryId)}});
  }

  async getCategoryAncestors(categoryId: number): Promise<Category[]> {
    const category = await this.categoryRepository.findOne({
      where: {id: Number(categoryId)},
    });

    const categoryAncestorsIds = category.path.split('.').slice(0, -1);

    if (categoryAncestorsIds.length >= 1) {
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
          // offersCount: MoreThan(0),
        },
        {
          path: Like(`%.${categoryId}.%`),
          // offersCount: MoreThan(0),
        },
      ],
    });

    this.categoryChildrenIds[categoryId] = categories
      .map((category) => category.id)
      .concat(categoryId);

    return this.categoryChildrenIds[categoryId].slice();
  }
}
