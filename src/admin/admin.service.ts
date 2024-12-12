import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Order} from 'src/entities/Order';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';
import {User} from 'src/entities/User';
import {IsNull, Not, Repository} from 'typeorm';

@Injectable()
export class AdminService {
  @InjectRepository(Order)
  private orderRepository: Repository<Order>;
  @InjectRepository(OrderGroup)
  private orderGroupRepository: Repository<OrderGroup>;
  @InjectRepository(OrderOffer)
  private orderOfferRepository: Repository<OrderOffer>;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  public getOrders() {
    return this.orderRepository.find({relations: {pickupPoint: true}});
  }

  public async getOrder(orderId: string) {
    const [order, orderGroups, orderOffers] = await Promise.all([
      this.orderRepository.findOne({where: {id: Number(orderId)}}),
      this.orderGroupRepository.find({
        where: {orderId: Number(orderId)},
        relations: {group: true},
      }),
      this.orderOfferRepository.find({where: {orderId: Number(orderId)}}),
    ]);

    return {order, groups: orderGroups, offers: orderOffers};
  }

  public getUser(userId: string) {
    return this.userRepository.findOne({
      where: {id: Number(userId)},
    });
  }

  public getUsers() {
    return this.userRepository.find({where: {phone: Not(IsNull())}});
  }
}
