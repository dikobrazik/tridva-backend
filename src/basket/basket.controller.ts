import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {BasketService} from './basket.service';
import {AppRequest, AppResponse} from 'src/shared/types';
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
  @Header('Cache-Control', 'max-age=180, private')
  public async getBasketItems(
    @Request() request: AppRequest,
    @Response({passthrough: true}) response: AppResponse,
  ) {
    const lastUpdatedBasketItem =
      await this.basketService.getUserBasketLastUpdatedAt(request.userId);

    if (lastUpdatedBasketItem) {
      const tag = `W/"last-updated-at-${lastUpdatedBasketItem.updatedAt.valueOf()}"`;

      response.set({
        Etag: tag,
      });

      if (request.headers['if-none-match'] === tag) {
        response.status(304);
        response.statusCode = HttpStatus.NOT_MODIFIED;
        return;
      }
    }

    return this.basketService.getUserBasket(request.userId);
  }

  @Get('count')
  public getBasketItemsCount(@Request() request: AppRequest) {
    return this.basketService.getUserBasketItemsCount(request.userId);
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
