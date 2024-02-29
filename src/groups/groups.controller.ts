import {
  Body,
  Controller,
  Inject,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {AuthGuard} from 'src/guards/auth.guard';
import {AuthorizedRequest} from 'src/shared/types';
import {CreateGroupOrderDto, JoinGroupParamsDto} from './dto';
import {GroupsService} from './groups.service';

@ApiTags('groups')
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
  @Post('/single')
  createSingleOfferGroup(
    @Request() request: AuthorizedRequest,
    @Body() body: CreateGroupOrderDto,
  ) {
    this.groupsService.createSingleGroup(body.offerId, request.userId);
  }

  @UseGuards(AuthGuard)
  @Post(':groupId/join')
  joinOfferGroup(
    @Request() request: AuthorizedRequest,
    @Param() params: JoinGroupParamsDto,
  ) {
    return this.groupsService.joinGroup(params.groupId, request.userId);
  }
}
