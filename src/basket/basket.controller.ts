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
import {UserId} from 'src/shared/decorators/UserId';

@UseGuards(AuthTokenGuard)
@ApiTags('basket')
@Controller('basket')
export class BasketController {
  @Inject(BasketService)
  private basketService: BasketService;

  @Get()
  @Header('Cache-Control', 'max-age=10, private')
  public async getBasketItems(
    @Request() request: AppRequest,
    @UserId() userId: number,
    @Response({passthrough: true}) response: AppResponse,
  ) {
    const lastUpdatedBasketItem =
      await this.basketService.getUserBasketLastUpdatedAt(userId);

    const tag = `W/"last-updated-at-${(
      lastUpdatedBasketItem?.updatedAt ?? new Date()
    ).valueOf()}"`;

    response.set({
      Etag: tag,
    });

    if (lastUpdatedBasketItem && request.headers['if-none-match'] === tag) {
      response.status(304);
      response.statusCode = HttpStatus.NOT_MODIFIED;
      return;
    }

    return this.basketService.getUserBasket(userId);
  }

  @Get('count')
  public getBasketItemsCount(@UserId() userId: number) {
    return this.basketService.getUserBasketItemsCount(userId);
  }

  @Get('/:offerId')
  public getBasketItemByOfferId(
    @UserId() userId: number,
    @Param() params: GetBasketItemByOfferIdPayload,
  ) {
    return this.basketService.getUserBasketItemByOfferId(
      userId,
      params.offerId,
    );
  }

  @Post('/offer')
  public putOfferToBasket(
    @UserId() userId: number,
    @Body() body: PutOfferToBasketBody,
  ) {
    return this.basketService.addOfferToBasket(userId, body.offerId);
  }

  @Post('/group')
  public async putGroupToBasket(
    @UserId() userId: number,
    @Body() body: PutGroupToBasketBody,
  ) {
    await this.basketService.addGroupToBasket(userId, body.groupId);
  }

  @Get('/:offerId/count')
  public getBasketItemCount(
    @UserId() userId: number,
    @Param() params: OfferCountParams,
  ) {
    return this.basketService.getBasketItemCount(userId, params.offerId);
  }

  @Put('/:id/count')
  public async changeBasketItemCount(
    @UserId() userId: number,
    @Body() body: ChangeBasketItemCountBody,
    @Param() params: BasketItemParams,
  ) {
    return this.basketService.changeBasketItemCount(
      userId,
      params.id,
      body.count,
    );
  }

  @Delete(':id')
  public removeItemFromBasket(
    @UserId() userId: number,
    @Param() params: BasketItemParams,
  ) {
    return this.basketService.removeItemFromBasket(userId, params.id);
  }
}
