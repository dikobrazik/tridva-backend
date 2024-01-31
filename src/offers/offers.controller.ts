import {Controller, Get, Query} from '@nestjs/common';
import {SearchOffersDto} from './dto';
import {OffersService} from './offers.service';
import {ApiTags} from '@nestjs/swagger';

@ApiTags('offer')
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @Get()
  search(@Query() query: SearchOffersDto) {
    return this.offersService.getOffersList(
      query.search,
      query.page,
      query.pageSize,
      query.category,
    );
  }
}
