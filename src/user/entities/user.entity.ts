import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    Index
  } from 'typeorm';
import { CustomerEntity } from '~/customer/entities/customer.entity';
import { PermissionEntity } from './permission.entity';
  
  @Entity('users')
  export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true, nullable: true })
    @Index()
    auth0Id?: string;  
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    firstName: string;
  
    @Column()
    lastName: string;
  
    @Column({ default: 'active' })
    status: 'active' | 'inactive';
  
    @Column('simple-array')
    roles: string[]; 
  
    @Column({ nullable: true })
    avatar?: string;
  
    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt?: Date;
  
    @OneToMany(() => PermissionEntity, permission => permission.user, {
      cascade: true,
    })
    permissions: PermissionEntity[];
  
    @OneToOne(() => CustomerEntity, customer => customer.user, {
        cascade: true,
        nullable: true,
        eager: false,
      })
      customer?: CustomerEntity;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  