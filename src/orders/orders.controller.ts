import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import {CreateOrderDto} from './dtos';
import {OrdersService} from './orders.service';
import {AuthTokenGuard} from 'src/guards/auth/token.guard';
import {UserId} from 'src/shared/decorators/UserId';
import {GeoService} from 'src/geo/geo.service';

@Controller('orders')
export class OrdersController {
  @Inject(OrdersService)
  private ordersService: OrdersService;
  @Inject(GeoService)
  private geoService: GeoService;

  @Post()
  @UseGuards(AuthTokenGuard)
  async createOrder(
    @Body() createOrderBody: CreateOrderDto,
    @UserId() userId: number,
  ) {
    const isPickupPointExist = await this.geoService.getIsPickupPointExist(
      createOrderBody.pickupPointId,
    );

    if (!isPickupPointExist) {
      throw new BadRequestException('No pickup point with given id');
    }

    await this.ordersService.createOrder(createOrderBody, userId);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  async getUserOrders(@UserId() userId: number) {
    return this.ordersService.getUserOrders(userId);
  }
}
