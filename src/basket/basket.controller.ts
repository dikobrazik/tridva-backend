import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {BasketService} from './basket.service';
import {AppRequest} from 'src/shared/types';
import {PutItemToBasketBody, RemoveItemFromBasketBody} from './dtos';
import {AuthTokenGuard} from 'src/guards/auth-token.guard';

@UseGuards(AuthTokenGuard)
@ApiTags('basket')
@Controller('basket')
export class BasketController {
  @Inject(BasketService)
  private basketService: BasketService;

  @Get()
  public getBasketItems(@Request() request: AppRequest) {
    return this.basketService.getUserBasket(request.userId);
  }

  @Put()
  public putItemToBasket(
    @Request() request: AppRequest,
    @Body() body: PutItemToBasketBody,
  ) {
    this.basketService.addGroupToBasket(request.userId, body.groupId);
  }

  @Delete(':id')
  public removeItemFromBasket(
    @Request() request: AppRequest,
    @Param() params: RemoveItemFromBasketBody,
  ) {
    this.basketService.removeItemFromBasket(request.userId, params.id);
  }
}
