import {Controller, Get} from '@nestjs/common';
import {CategoryService} from './category.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  getCategoriesList() {
    return this.categoryService.getCategoriesList();
  }
}
