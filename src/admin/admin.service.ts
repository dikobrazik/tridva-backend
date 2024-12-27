import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {OrderStatus} from 'src/entities/enums';
import {Order} from 'src/entities/Order';
import {OrderGroup} from 'src/entities/OrderGroup';
import {OrderOffer} from 'src/entities/OrderOffer';
import {Payment} from 'src/entities/Payment';
import {User} from 'src/entities/User';
import {IsNull, Not, Repository} from 'typeorm';
import {OrderDto} from './dtos';

const ORDER_TRANSITION_MAP = {
  [OrderStatus.PAID]: OrderStatus.TO_DELIVERY,
  [OrderStatus.TO_DELIVERY]: OrderStatus.IN_DELIVERY,
  [OrderStatus.IN_DELIVERY]: OrderStatus.DELIVERED,
};

@Injectable()
export class AdminService {
  @InjectRepository(Order)
  private orderRepository: Repository<Order>;
  @InjectRepository(Payment)
  private paymentRepository: Repository<Payment>;
  @InjectRepository(OrderGroup)
  private orderGroupRepository: Repository<OrderGroup>;
  @InjectRepository(OrderOffer)
  private orderOfferRepository: Repository<OrderOffer>;

  @InjectRepository(User)
  private userRepository: Repository<User>;

  public getOrders() {
    return this.orderRepository.find({relations: {pickupPoint: true}});
  }

  public getGroupOrders() {
    return this.orderGroupRepository.find({relations: {group: {offer: true}}});
  }

  public getOfferOrders() {
    return this.orderOfferRepository.find({relations: {offer: true}});
  }

  public async getOrder(orderId: string) {
    const [order, payment, orderGroups, orderOffers] = await Promise.all([
      this.orderRepository.findOne({where: {id: Number(orderId)}}),
      this.paymentRepository.findOne({where: {orderId: Number(orderId)}}),
      this.orderGroupRepository.find({
        where: {orderId: Number(orderId)},
        relations: {group: {offer: true}},
      }),
      this.orderOfferRepository.find({
        where: {orderId: Number(orderId)},
        relations: {offer: true},
      }),
    ]);

    return {order, payment, groups: orderGroups, offers: orderOffers};
  }

  public async changeGroupOrderStatus(offerOrder: OrderDto) {
    await this.orderGroupRepository.update(
      {id: offerOrder.id},
      {status: ORDER_TRANSITION_MAP[offerOrder.status]},
    );
  }

  public async changeOfferOrderStatus(offerOrder: OrderDto) {
    await this.orderOfferRepository.update(
      {id: offerOrder.id},
      {status: ORDER_TRANSITION_MAP[offerOrder.status]},
    );
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
