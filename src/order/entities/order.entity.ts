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
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
    eager: true,
    cascade: true,
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

  @ManyToOne(() => Address, { eager: true })
  @JoinColumn({ name: 'shipping_address_id' })
  shippingAddress: Address;

  @ManyToOne(() => Address, { eager: true, nullable: true })
  @JoinColumn({ name: 'billing_address_id' })
  billingAddress?: Address;

  @Column({ nullable: true })
  notes?: string;

  @Column({ nullable: true })
  trackingNumber?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ nullable: true })
  deliveredAt?: string;

  @Column({ nullable: true })
  customerNotes?: string;

  @Column({ nullable: true })
  adminNotes?: string;
}
