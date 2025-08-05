import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { AddressEntity } from './address.entity';
  
  @Entity('customers')
  export class CustomerEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @OneToOne(() => UserEntity, user => user.customer, {
        onDelete: 'CASCADE',
        eager: true,
      })
      @JoinColumn()
      user: UserEntity;
  
    @Column()
    email: string;
  
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    @Column({ nullable: true })
    phone?: string;
  
    @Column({ nullable: true })
    dateOfBirth?: string;
  
    @Column({ nullable: true })
    gender?: 'male' | 'female' | 'other';
  
    @Column({ default: 'active' })
    status: 'active' | 'inactive' | 'blocked';
  
    @Column({ default: false })
    emailVerified: boolean;
  
    @Column({ default: false })
    phoneVerified: boolean;
  
    @Column({ type: 'int', default: 0 })
    totalOrders: number;
  
    @Column({ type: 'decimal', default: 0 })
    totalSpent: number;
  
    @Column({ type: 'decimal', default: 0 })
    averageOrderValue: number;
  
    @Column({ type: 'timestamp', nullable: true })
    lastOrderDate?: Date;
  
    @Column('simple-array', { default: '' })
    tags: string[];
  
    @Column({ nullable: true })
    segment?: 'vip' | 'regular' | 'new' | 'inactive';
  
    @Column({ default: false })
    marketingConsent: boolean;
  
    @Column({ default: 'uk' })
    preferredLanguage: string;
  
    @Column({ default: 'UAH' })
    preferredCurrency: string;
  
    @OneToMany(() => AddressEntity, address => address.customer, {
        cascade: true,
        eager: true, 
      })
      addresses: AddressEntity[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  