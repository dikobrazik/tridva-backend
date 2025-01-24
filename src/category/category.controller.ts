import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Query,
  StreamableFile,
} from '@nestjs/common';
import {CategoryService} from './category.service';
import {ApiTags} from '@nestjs/swagger';
import {FindOneParams} from 'src/dtos/category';
import {createReadStream, existsSync} from 'fs';
import {join} from 'path';

const MONTH_IN_SECONDS = 60 * 60 * 24 * 30;

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  private defaultIconPath = join(
    process.cwd(),
    'public',
    'categories-icons',
    'default.svg',
  );

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

  @Get(':id/icon')
  @Header('Content-Type', 'image/svg+xml')
  @Header('Cache-Control', `max-age=${MONTH_IN_SECONDS}, public`)
  getFileUsingStaticValues(@Param() params: FindOneParams): StreamableFile {
    const iconPath = join(
      process.cwd(),
      'public',
      'categories-icons',
      `${params.id}.svg`,
    );

    if (existsSync(iconPath)) {
      const icon = createReadStream(iconPath);
      return new StreamableFile(icon);
    }

    const defaultIcon = createReadStream(this.defaultIconPath);
    return new StreamableFile(defaultIcon);
  }

  @Get(':id/is-popular')
  async getIsPopularCategory(@Param() params: FindOneParams) {
    return this.categoryService
      .getPopularCategoriesList()
      .map((category) => category.id)
      .includes(Number(params.id));
  }

  @Get(':id/ancestors')
  getCategoryAncestors(@Param() params: FindOneParams) {
    return this.categoryService.getCategoryAncestors(params.id);
  }
}
