import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Query,
  Redirect,
  Res,
  UseGuards,
} from '@nestjs/common';
import {CancelOrderDto, CreateOrderDto, PaymentDto} from './dtos';
import {OrdersService} from './orders.service';
import {AuthTokenGuard} from 'src/guards/auth/token.guard';
import {UserId} from 'src/shared/decorators/UserId';
import {GeoService} from 'src/geo/geo.service';
import {KassaNotification} from 'src/kassa/types';
import {Response} from 'express';
import {OrdersCancelService} from './orders-cancel.service';
import {OrdersPaymentNotificationService} from './orders-payment-notification.service';

@Controller('orders')
export class OrdersController {
  @Inject(OrdersService)
  private ordersService: OrdersService;
  @Inject(OrdersCancelService)
  private ordersCancelService: OrdersCancelService;
  @Inject(OrdersPaymentNotificationService)
  private ordersPaymentNotificationService: OrdersPaymentNotificationService;
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

    return this.ordersService.createOrder(createOrderBody, userId);
  }

  @Post('/cancel')
  @UseGuards(AuthTokenGuard)
  async cancelOrder(
    @Body() cancelOrderBody: CancelOrderDto,
    @UserId() userId: number,
  ) {
    const isUserOrder = await this.ordersService.getIsUserOrder(
      cancelOrderBody,
      userId,
    );

    if (!isUserOrder) {
      throw new BadRequestException('User has no orders with given parameters');
    }

    return this.ordersCancelService.cancelOrder(cancelOrderBody.orderId);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  async getUserOrders(@UserId() userId: number) {
    return this.ordersService.getUserOrders(userId);
  }

  @Get('count')
  @UseGuards(AuthTokenGuard)
  async getUserOrdersCount(@UserId() userId: number) {
    return this.ordersService.getUserOrdersCount(userId);
  }

  @Get('payment')
  @Redirect()
  @UseGuards(AuthTokenGuard)
  async payment(@Query() paymentDto: PaymentDto, @UserId() userId: number) {
    const paymentUrl = await this.ordersService.getOrderPaymentUrl(
      paymentDto,
      userId,
    );

    if (!paymentUrl)
      throw new BadRequestException('User has not order with given id');

    return {url: paymentUrl};
  }

  @Post('/notify')
  async notification(
    @Body() body: KassaNotification,
    @Res({passthrough: true}) response: Response,
  ) {
    response.statusCode = HttpStatus.OK;

    await this.ordersPaymentNotificationService.processNotification(body);
  }
}
