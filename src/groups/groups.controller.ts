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
import {AuthTokenGuard} from 'src/guards/auth-token.guard';
import {AppRequest} from 'src/shared/types';
import {CreateGroupOrderDto, JoinGroupParamsDto} from './dto';
import {GroupsService} from './groups.service';

@UseGuards(AuthTokenGuard)
@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  @Inject(GroupsService)
  private groupsService: GroupsService;

  @Post()
  createOfferGroup(
    @Request() request: AppRequest,
    @Body() body: CreateGroupOrderDto,
  ) {
    this.groupsService.createGroup(body.offerId, request.userId);
  }

  @Post('/single')
  createSingleOfferGroup(
    @Request() request: AppRequest,
    @Body() body: CreateGroupOrderDto,
  ) {
    this.groupsService.createSingleGroup(body.offerId, request.userId);
  }

  @Post(':groupId/join')
  joinOfferGroup(
    @Request() request: AppRequest,
    @Param() params: JoinGroupParamsDto,
  ) {
    return this.groupsService.joinGroup(params.groupId, request.userId);
  }
}
