import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {BasketService} from './basket.service';
import {AppRequest} from 'src/shared/types';
import {
  ChangeBasketItemCountBody,
  PutGroupToBasketBody,
  PutOfferToBasketBody,
  BasketItemParams,
} from './dtos';
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

  @Post('/offer')
  public putOfferToBasket(
    @Request() request: AppRequest,
    @Body() body: PutOfferToBasketBody,
  ) {
    this.basketService.addOfferToBasket(request.userId, body.offerId);
  }

  @Post('/group')
  public putGroupToBasket(
    @Request() request: AppRequest,
    @Body() body: PutGroupToBasketBody,
  ) {
    this.basketService.addGroupToBasket(request.userId, body.groupId);
  }

  @Put('/:id/count')
  public async changeBasketItemCount(
    @Body() body: ChangeBasketItemCountBody,
    @Param() params: BasketItemParams,
  ) {
    await this.basketService.changeBasketItemCount(params.id, body.count);
  }

  @Delete(':id')
  public removeItemFromBasket(
    @Request() request: AppRequest,
    @Param() params: BasketItemParams,
  ) {
    this.basketService.removeItemFromBasket(request.userId, params.id);
  }
}
