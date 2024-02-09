import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CreateGroupOrderDto,
  GetGroupsDto,
  GetGroupsTotalDto,
  JoinGroupParamsDto,
} from './dto';
import {AuthorizedRequest} from 'src/shared/types';
import {AuthGuard} from 'src/guards/auth.guard';
import {GroupsService} from './groups.service';

@Controller('groups')
export class GroupsController {
  @Inject(GroupsService)
  private groupsService: GroupsService;

  @UseGuards(AuthGuard)
  @Post()
  createOfferGroup(
    @Request() request: AuthorizedRequest,
    @Body() body: CreateGroupOrderDto,
  ) {
    this.groupsService.createGroup(body.offerId, request.userId);
  }

  @UseGuards(AuthGuard)
  @Post(':groupId/join')
  joinOfferGroup(
    @Request() request: AuthorizedRequest,
    @Param() params: JoinGroupParamsDto,
  ) {
    return this.groupsService.joinGroup(params.groupId, request.userId);
  }

  @Get(':offerId')
  getOfferGroups(@Param() params: GetGroupsDto) {
    return this.groupsService.getOfferGroups(params.offerId);
  }
}
