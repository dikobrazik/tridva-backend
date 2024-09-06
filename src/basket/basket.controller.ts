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
  OfferCountParams,
  GetBasketItemByOfferIdPayload,
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

  @Get('/:offerId')
  public getBasketItemByOfferId(
    @Request() request: AppRequest,
    @Param() params: GetBasketItemByOfferIdPayload,
  ) {
    return this.basketService.getUserBasketItemByOfferId(
      request.userId,
      params.offerId,
    );
  }

  @Post('/offer')
  public putOfferToBasket(
    @Request() request: AppRequest,
    @Body() body: PutOfferToBasketBody,
  ) {
    return this.basketService.addOfferToBasket(request.userId, body.offerId);
  }

  @Post('/group')
  public async putGroupToBasket(
    @Request() request: AppRequest,
    @Body() body: PutGroupToBasketBody,
  ) {
    await this.basketService.addGroupToBasket(request.userId, body.groupId);
  }

  @Get('/:offerId/count')
  public getBasketItemCount(
    @Request() request: AppRequest,
    @Param() params: OfferCountParams,
  ) {
    return this.basketService.getBasketItemCount(
      request.userId,
      params.offerId,
    );
  }

  @Put('/:id/count')
  public async changeBasketItemCount(
    @Request() request: AppRequest,
    @Body() body: ChangeBasketItemCountBody,
    @Param() params: BasketItemParams,
  ) {
    await this.basketService.changeBasketItemCount(
      request.userId,
      params.id,
      body.count,
    );
  }

  @Delete(':id')
  public removeItemFromBasket(
    @Request() request: AppRequest,
    @Param() params: BasketItemParams,
  ) {
    this.basketService.removeItemFromBasket(request.userId, params.id);
  }
}
