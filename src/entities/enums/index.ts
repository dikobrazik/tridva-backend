export enum OrderStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  PAYMENT_ERROR = 'PAYMENT_ERROR',
  TO_DELIVERY = 'TO_DELIVERY',
  IN_DELIVERY = 'IN_DELIVERY',
  DELIVERED = 'DELIVERED',
  RECEIVED = 'RECEIVED',
  CANCELED = 'CANCELED',
}

export enum PaymentStatus {
  CREATED = 'CREATED',
  RECEIVED = 'RECEIVED',
  RETURNED = 'RETURNED',
  CANCELED = 'CANCELED',
}
