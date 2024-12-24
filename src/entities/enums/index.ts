export enum OrderStatus {
  CREATED,
  PAID,
  PAYMENT_ERROR,
  IN_DELIVERY,
  DELIVERED,
  RECEIVED,
}

export const OrderStatusText = {
  [OrderStatus.CREATED]: 'CREATED',
  [OrderStatus.PAID]: 'PAID',
  [OrderStatus.PAYMENT_ERROR]: 'PAYMENT_ERROR',
  [OrderStatus.IN_DELIVERY]: 'IN_DELIVERY',
  [OrderStatus.DELIVERED]: 'DELIVERED',
  [OrderStatus.RECEIVED]: 'RECEIVED',
} as const;
