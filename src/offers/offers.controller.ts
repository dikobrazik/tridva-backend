import {Controller, Get, Param, Query} from '@nestjs/common';
import {SearchOfferDto, SearchOffersDto} from './dto';
import {OffersService} from './offers.service';
import {ApiTags} from '@nestjs/swagger';
import {GroupsService} from 'src/groups/groups.service';
import {AttributesService} from 'src/attributes/attributes.service';

@ApiTags('offer')
@Controller('offers')
export class OffersController {
  constructor(
    private offersService: OffersService,
    private groupsService: GroupsService,
    private attributesService: AttributesService,
  ) {}

  @Get()
  getOffers(@Query() query: SearchOffersDto) {
    if (!query.search && !query.category) {
      return this.offersService.getRandomOffersList(query.page, query.pageSize);
    }

    return this.offersService.getOffersList(
      query.search,
      query.page,
      query.pageSize,
      query.category,
    );
  }

  @Get(':id')
  getOffer(@Param() params: SearchOfferDto) {
    return this.offersService.getOfferById(params.id);
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
