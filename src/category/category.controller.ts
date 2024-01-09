import {Controller, Get, Query} from '@nestjs/common';
import {CategoryService} from './category.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getCategoriesList(@Query('level') level: number = 1) {
    return this.categoryService.getCategoriesList(level);
  }
}
