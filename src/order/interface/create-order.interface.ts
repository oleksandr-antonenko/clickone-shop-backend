export enum OrderStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Processing = 'processing',
  Shipped = 'shipped',
  Delivered = 'delivered',
  Cancelled = 'cancelled',
  Returned = 'returned',
}

export enum PaymentStatus {
  Pending = 'pending',
  Paid = 'paid',
  Failed = 'failed',
  Refunded = 'refunded',
}

export enum PaymentMethod {
  Card = 'card',
  Cash = 'cash',
  BankTransfer = 'bank_transfer',
  PayPal = 'paypal',
  ApplePay = 'apple_pay',
  GooglePay = 'google_pay',
}

export enum ShippingMethod {
  Standard = 'standard',
  Express = 'express',
  Pickup = 'pickup',
}
