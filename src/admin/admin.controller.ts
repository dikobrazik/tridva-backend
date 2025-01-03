import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Render,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {LoginDto, OrderDto} from './dtos';
import {Response} from 'express';
import {LoginGuard} from './auth/guards/login.guard';
import {AuthenticatedGuard} from './auth/guards/auth.guard';
import {AuthExceptionFilter} from './auth/filters/auth.filter';
import {AdminService} from './admin.service';

@Controller('admin')
@UseFilters(AuthExceptionFilter)
export class AdminController {
  @Inject(AdminService)
  private adminService: AdminService;

  @Get()
  @Render('index')
  @UseGuards(AuthenticatedGuard)
  root() {
    return {message: 'Hello world!'};
  }

  @Get('/orders')
  @Render('orders')
  @UseGuards(AuthenticatedGuard)
  async orders() {
    const orders = await this.adminService.getOrders();
    return {orders};
  }

  @Get('/group-orders')
  @Render('group-orders')
  @UseGuards(AuthenticatedGuard)
  async groupOrders() {
    const orders = await this.adminService.getGroupOrders();
    return {orders};
  }

  @Get('/offer-orders')
  @Render('offer-orders')
  @UseGuards(AuthenticatedGuard)
  async offerOrders() {
    const orders = await this.adminService.getOfferOrders();
    return {orders};
  }

  @Get('/orders/:id')
  @Render('order')
  @UseGuards(AuthenticatedGuard)
  async order(@Param('id') orderId: string) {
    const {order, payment, groups, offers} = await this.adminService.getOrder(
      orderId,
    );
    return {order, payment, groups, offers};
  }

  @Get('/users')
  @Render('users')
  @UseGuards(AuthenticatedGuard)
  async users() {
    const users = await this.adminService.getUsers();
    return {users};
  }

  @Get('/users/:id')
  @Render('user')
  @UseGuards(AuthenticatedGuard)
  async user(@Param('id') userId: string) {
    const user = await this.adminService.getUser(userId);
    return {user};
  }

  @Get('/login')
  @Render('login')
  login() {
    return {message: 'Hello world!'};
  }

  @Post('/login')
  @UseGuards(LoginGuard)
  loginUser(@Body() body: LoginDto, @Res() res: Response) {
    res.redirect('/admin');
  }

  @Post('/group-orders/change-status')
  @UseGuards(AuthenticatedGuard)
  async changeGroupOrderStatus(@Body() body: OrderDto) {
    await this.adminService.changeGroupOrderStatus(body);
  }

  @Post('/offer-orders/change-status')
  @UseGuards(AuthenticatedGuard)
  async changeOfferOrderStatus(@Body() body: OrderDto) {
    await this.adminService.changeOfferOrderStatus(body);
  }
}
