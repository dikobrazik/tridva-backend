import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Order} from 'src/entities/Order';
import {Repository} from 'typeorm';

@Injectable()
export class OrdersService {
  @InjectRepository(Order)
  private ordersRepository: Repository<Order>;

  public async processOrder() {
    this.ordersRepository.insert({});
  }
}
