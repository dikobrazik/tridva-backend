import {Controller, Get, Param, Query} from '@nestjs/common';
import {OffersTotalDto, SearchOfferDto, SearchOffersDto} from './dto';
import {OffersService} from './offers.service';
import {ApiTags} from '@nestjs/swagger';
import {GroupsService} from 'src/groups/groups.service';

@ApiTags('offer')
@Controller('offers')
export class OffersController {
  constructor(
    private offersService: OffersService,
    private groupsService: GroupsService,
  ) {}

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

  @Get(':id/groups')
  getOfferGroups(@Param() params: SearchOfferDto) {
    return this.groupsService.getOfferGroups(params.id);
  }
}
