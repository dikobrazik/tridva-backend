export enum OrderStatus {
  CREATED,
  PAID,
  PAYMENT_ERROR,
  IN_DELIVERY,
  DELIVERED,
}

export const OrderStatusText = {
  CREATED: OrderStatus.CREATED,
  PAID: OrderStatus.PAID,
  PAYMENT_ERROR: OrderStatus.PAYMENT_ERROR,
  IN_DELIVERY: OrderStatus.IN_DELIVERY,
  DELIVERED: OrderStatus.DELIVERED,
};
