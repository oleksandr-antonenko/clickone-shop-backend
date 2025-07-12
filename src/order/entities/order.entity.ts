import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingMethod,
} from '../interface/create-order.interface';
import { Address } from './address.entity';
import { OrderItem } from './orderItem.entity';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderNumber: string;

  @Column()
  customerId: string;

  @Column()
  status: OrderStatus;

  @Column()
  paymentStatus: PaymentStatus;

  @Column()
  paymentMethod: PaymentMethod;

  @Column()
  shippingMethod: ShippingMethod;

  @OneToMany(() => OrderItem, (item) => item.order, {
    cascade: true,
    eager: true,
  })
  items: OrderItem[];

  @Column('decimal')
  subTotal: number;

  @Column('decimal')
  shippingCost: number;

  @Column('decimal')
  taxAmount: number;

  @Column('decimal')
  discountAmount: number;

  @Column('decimal')
  total: number;

  @Column()
  currency: string;

  @ManyToOne(() => Address, { cascade: true, eager: true })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: Address;

  @ManyToOne(() => Address, { cascade: true, eager: true, nullable: true })
  @JoinColumn({ name: 'billing_address_id' })
  billingAddress?: Address;

  @Column()
  notes?: string;

  @Column()
  trackingNumber?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column()
  deliveredAt?: string;

  @Column()
  customerNotes?: string;

  @Column()
  adminNotes?: string;
}
