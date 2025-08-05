import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
  } from 'typeorm';
  import { CustomerEntity } from './customer.entity';
  
  @Entity('addresses')
  export class AddressEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => CustomerEntity, customer => customer.addresses, {
        onDelete: 'CASCADE',
        nullable: false,
      })
      customer: CustomerEntity;
  
    @Column({ nullable: true })
    type?: 'shipping' | 'billing' | 'both';
  
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
  }
  