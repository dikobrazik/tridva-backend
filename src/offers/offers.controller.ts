import {
  Controller,
  Get,
  Header,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {SearchOfferDto, SearchOffersDto} from './dto';
import {OffersService} from './offers.service';
import {ApiTags} from '@nestjs/swagger';
import {GroupsService} from 'src/groups/groups.service';
import {AttributesService} from 'src/attributes/attributes.service';
import {AuthTokenGuard} from 'src/guards/auth/token.guard';
import {FavoriteOffersService} from './favoriteOffers.service';
import {UserId} from 'src/shared/decorators/UserId';

@ApiTags('offer')
@Controller('offers')
export class OffersController {
  constructor(
    private favoriteOffersService: FavoriteOffersService,
    private offersService: OffersService,
    private groupsService: GroupsService,
    private attributesService: AttributesService,
  ) {}

  @Get()
  @Header('Cache-Control', 'max-age=60, public')
  getOffers(@Query() query: SearchOffersDto) {
    if (query.search) {
      return this.offersService.getOffersListBySearch(
        query.search,
        query.page,
        query.pageSize,
      );
    }

    if (query.category) {
      return this.offersService.getOffersListByCategory(
        query.category,
        query.page,
        query.pageSize,
      );
    }

    return this.offersService.getRandomOffersList(query.page, query.pageSize);
  }

  @Get('favorite')
  @UseGuards(AuthTokenGuard)
  getFavoriteOffers(@UserId() userId: number) {
    return this.favoriteOffersService.getFavoriteOffers(userId);
  }

  @Get('favorite/ids')
  @UseGuards(AuthTokenGuard)
  getFavoriteOffersIds(@UserId() userId: number) {
    return this.favoriteOffersService
      .getFavoriteOffers(userId)
      .then((offers) => offers.map((offer) => offer.id));
  }

  @Get(':id')
  @Header('Cache-Control', 'max-age=20, public')
  async getOffer(@Param() params: SearchOfferDto) {
    const offer = await this.offersService.getOfferById(params.id);

    if (offer === null) {
      throw new NotFoundException();
    }

    return offer;
  }

  @Get(':id/favorite')
  @UseGuards(AuthTokenGuard)
  getIsFavoriteOffer(
    @Param() params: SearchOfferDto,
    @UserId() userId: number,
  ) {
    return this.favoriteOffersService.getIsFavoriteOffer(params.id, userId);
  }

  @Post(':id/favorite')
  @UseGuards(AuthTokenGuard)
  addFavoriteOffer(@Param() params: SearchOfferDto, @UserId() userId: number) {
    return this.favoriteOffersService.addFavoriteOffer(params.id, userId);
  }

  @Get(':id/groups')
  getOfferGroups(@Param() params: SearchOfferDto) {
    return this.groupsService.getOfferGroups(params.id);
  }

  @Get(':id/attributes')
  getOfferAttributes(@Param() params: SearchOfferDto) {
    return this.attributesService.getOfferAttributes(params.id);
  }

  @Get(':id/attributes/count')
  getOfferAttributesCount(@Param() params: SearchOfferDto) {
    return this.attributesService.getOfferAttributesCount(params.id);
  }
}
