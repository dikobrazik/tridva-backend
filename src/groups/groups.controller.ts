import {
  Body,
  Controller,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {AuthTokenGuard} from 'src/guards/auth-token.guard';
import {AppRequest} from 'src/shared/types';
import {CreateGroupOrderDto} from './dto';
import {GroupsService} from './groups.service';
import {BasketService} from 'src/basket/basket.service';

@UseGuards(AuthTokenGuard)
@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  @Inject(GroupsService)
  private groupsService: GroupsService;

  @Inject(BasketService)
  private basketService: BasketService;

  @Post()
  async createGroup(
    @Request() request: AppRequest,
    @Body() body: CreateGroupOrderDto,
  ) {
    const groupId = await this.groupsService.createGroup(
      body.offerId,
      request.userId,
    );

    await this.basketService.addGroupToBasket(request.userId, groupId);
  }
}
