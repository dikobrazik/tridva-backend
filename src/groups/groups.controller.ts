import {Body, Controller, Get, Inject, Post, UseGuards} from '@nestjs/common';
import {ApiTags} from '@nestjs/swagger';
import {AuthTokenGuard} from 'src/guards/auth/token.guard';
import {CreateGroupOrderDto} from './dto';
import {GroupsService} from './groups.service';
import {BasketService} from 'src/basket/basket.service';
import {UserId} from 'src/shared/decorators/UserId';

@UseGuards(AuthTokenGuard)
@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  @Inject(GroupsService)
  private groupsService: GroupsService;

  @Inject(BasketService)
  private basketService: BasketService;

  @Post()
  @UseGuards(AuthTokenGuard)
  async createGroup(
    @UserId() userId: number,
    @Body() body: CreateGroupOrderDto,
  ) {
    const groupId = await this.groupsService.createGroup(body.offerId, userId);

    await this.basketService.addGroupToBasket(userId, groupId);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  getUserGroups(@UserId() userId: number) {
    return this.groupsService.getUserGroups(userId);
  }
}
