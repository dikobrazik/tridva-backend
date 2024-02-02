import {Controller, Get, Param, Query} from '@nestjs/common';
import {OffersTotalDto, SearchOfferDto, SearchOffersDto} from './dto';
import {OffersService} from './offers.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('offer')
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Get()
  getOffers(@Query() query: SearchOffersDto) {
    return this.offersService.getOffersList(
      query.search,
      query.page,
      query.pageSize,
      query.category,
    );
  }

  @Get('total')
  getOffersTotalCount(@Query() query: OffersTotalDto) {
    return this.offersService.getOffersTotal(query.search, query.category);
  }

  @Get(':id')
  getOffer(@Param() params: SearchOfferDto) {
    return this.offersService.getOfferById(params.id);
  }
}
