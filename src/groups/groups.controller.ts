import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {AuthTokenGuard} from 'src/guards/auth/token.guard';
import {CreateGroupOrderDto, ExitGroupOrderDto} from './dto';
import {GroupsService} from './groups.service';
import {BasketService} from 'src/basket/basket.service';
import {UserId} from 'src/shared/decorators/UserId';
import {OrdersCancelService} from 'src/orders/orders-cancel.service';

@UseGuards(AuthTokenGuard)
@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  @Inject(GroupsService)
  private groupsService: GroupsService;
  @Inject(OrdersCancelService)
  private ordersCancelService: OrdersCancelService;

  @Inject(BasketService)
  private basketService: BasketService;

  @Post()
  @UseGuards(AuthTokenGuard)
  async createGroup(
    @UserId() userId: number,
    @Body() body: CreateGroupOrderDto,
  ) {
    const groupId = await this.groupsService.createGroup(body.offerId, userId);

    return this.basketService.addGroupToBasket(userId, groupId);
  }

  @Post('/:groupId/cancel')
  @UseGuards(AuthTokenGuard)
  async cancelGroup(
    @UserId() userId: number,
    @Param() param: ExitGroupOrderDto,
  ) {
    const groupOrder = await this.groupsService.getUserGroupOrderByGroupId(
      param.groupId,
      userId,
    );

    if (!groupOrder) {
      throw new BadRequestException('User has no orders with given parameters');
    }

    return this.ordersCancelService.cancelGroupOrder(groupOrder.id);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  getUserGroups(@UserId() userId: number) {
    return this.groupsService.getUserGroups(userId);
  }

  @Get('/count')
  @UseGuards(AuthTokenGuard)
  getUserGroupsCount(@UserId() userId: number) {
    return this.groupsService.getUserGroupsCount(userId);
  }
}
