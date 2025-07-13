import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Order } from './order.entity';

@Entity('address')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  company?: string;

  @Column()
  address1: string;

  @Column({ nullable: true })
  address2?: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  postalCode: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  phone?: string;

  @OneToMany(() => Order, (order) => order.shippingAddress)
  shippingOrders: Order[];

  @OneToMany(() => Order, (order) => order.billingAddress)
  billingOrders: Order[];
}
