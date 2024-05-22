import {Body, Controller, Post} from '@nestjs/common';
import {ProcessOrderDto} from './dtos';

@Controller('orders')
export class OrdersController {
  @Post()
  createOrder(@Body() processOrderBody: ProcessOrderDto) {
    console.log(processOrderBody);
  }
}
