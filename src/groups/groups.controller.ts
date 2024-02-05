import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CreateGroupOrderDto,
  GetGroupsDto,
  GetGroupsTotalDto,
  JoinGroupOrderDto,
} from './dto';
import {Paginable} from 'src/shared/dto/pagination';
import {AuthorizedRequest} from 'src/shared/types';
import {AuthGuard} from 'src/guards/auth.guard';

@Controller('groups')
export class GroupsController {
  @UseGuards(AuthGuard)
  @Post()
  createOfferGroup(
    @Request() request: AuthorizedRequest,
    @Body() body: CreateGroupOrderDto,
  ) {
    return [];
  }

  @UseGuards(AuthGuard)
  @Post()
  joinOfferGroup(
    @Request() request: AuthorizedRequest,
    @Body() body: JoinGroupOrderDto,
  ) {
    return [];
  }

  @Get(':offerId')
  getOfferGroups(@Param() params: GetGroupsDto, @Query() query: Paginable) {
    return [];
  }

  @Get(':offerId/total')
  getOfferGroupsTotal(@Query() params: GetGroupsTotalDto) {
    return 2;
  }
}
