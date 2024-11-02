import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {SearchOfferDto, SearchOffersDto} from './dto';
import {OffersService} from './offers.service';
import {ApiTags} from '@nestjs/swagger';
import {GroupsService} from 'src/groups/groups.service';
import {AttributesService} from 'src/attributes/attributes.service';
import {AuthTokenGuard} from 'src/guards/auth-token.guard';
import {AppRequest} from 'src/shared/types';
import {FavoriteOffersService} from './favoriteOffers.service';

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

  @Get(':id')
  getOffer(@Param() params: SearchOfferDto) {
    return this.offersService.getOfferById(params.id);
  }

  @Get('favorite')
  @UseGuards(AuthTokenGuard)
  getFavoriteOffers(@Request() request: AppRequest) {
    return this.favoriteOffersService.getFavoriteOffers(request.userId);
  }

  @Get('favorite/ids')
  @UseGuards(AuthTokenGuard)
  getFavoriteOffersIds(@Request() request: AppRequest) {
    return this.favoriteOffersService
      .getFavoriteOffers(request.userId)
      .then((offers) => offers.map((offer) => offer.id));
  }

  @Get(':id/favorite')
  @UseGuards(AuthTokenGuard)
  getIsFavoriteOffer(
    @Param() params: SearchOfferDto,
    @Request() request: AppRequest,
  ) {
    return this.favoriteOffersService.getIsFavoriteOffer(
      params.id,
      request.userId,
    );
  }

  @Post(':id/favorite')
  @UseGuards(AuthTokenGuard)
  addFavoriteOffer(
    @Param() params: SearchOfferDto,
    @Request() request: AppRequest,
  ) {
    return this.favoriteOffersService.addFavoriteOffer(
      params.id,
      request.userId,
    );
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
