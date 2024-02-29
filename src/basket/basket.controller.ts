import {
  Body,
  Controller,
  Get,
  Inject,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {BasketService} from './basket.service';
import {AuthGuard} from 'src/guards/auth.guard';
import {AuthorizedRequest} from 'src/shared/types';
import {PutItemToBasketBody} from './dtos';

@UseGuards(AuthGuard)
@ApiTags('basket')
@Controller('basket')
export class BasketController {
  @Inject(BasketService)
  private basketService: BasketService;

  @Get()
  public getBasketItems(@Request() request: AuthorizedRequest) {
    return this.basketService.getUserBasket(request.userId);
  }

  @Put()
  public putItemToBasket(
    @Request() request: AuthorizedRequest,
    @Body() body: PutItemToBasketBody,
  ) {
    this.basketService.addGroupToBasket(request.userId, body.groupId);
  }
}
