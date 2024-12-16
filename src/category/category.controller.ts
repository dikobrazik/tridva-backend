import {Controller, Get, NotFoundException, Param, Query} from '@nestjs/common';
import {CategoryService} from './category.service';
import {ApiTags} from '@nestjs/swagger';
import {FindOneParams} from 'src/dtos/category';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getCategoriesList(
    @Query('level') level: number,
    @Query('name') name: string,
  ) {
    return this.categoryService.getCategoriesList(level, name);
  }

  @Get('popular')
  getPopularCategoriesList() {
    return this.categoryService.getPopularCategoriesList();
  }

  @Get(':id')
  async getCategoryById(@Param() params: FindOneParams) {
    const category = await this.categoryService.getCategoryById(params.id);

    if (!category) {
      throw new NotFoundException();
    }

    return category;
  }

  @Get(':id/is-popular')
  async getIsPopularCategory(@Param() params: FindOneParams) {
    return this.categoryService
      .getPopularCategoriesList()
      .map((category) => category.id)
      .includes(params.id);
  }

  @Get(':id/ancestors')
  getCategoryAncestors(@Param() params: FindOneParams) {
    return this.categoryService.getCategoryAncestors(params.id);
  }
}
