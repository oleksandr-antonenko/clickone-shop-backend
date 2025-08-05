import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  Index
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { PermissionEntity } from './permission.entity';

@Entity('admins')
export class AdminEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index()
  auth0Id: string; 

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ default: 'active' })
  status: 'active' | 'inactive' | 'suspended';

  @Column('simple-array')
  roles: string[]; 

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt?: Date;

  @Column({ nullable: true })
  department?: string; 

  @Column({ nullable: true })
  position?: string;

  @Column({ default: false })
  isSuperAdmin: boolean;

  @Column({ default: false })
  canManageAdmins: boolean;

  @Column({ default: false })
  canViewAnalytics: boolean;

  @Column({ default: false })
  canManageUsers: boolean;

  @Column({ default: false })
  canManageOrders: boolean;

  @Column({ default: false })
  canManageProducts: boolean;

  @Column({ default: false })
  canManageCustomers: boolean;

  @Column({ nullable: true })
  notes?: string;

  @OneToOne(() => UserEntity, { nullable: true })
  @JoinColumn()
  linkedUser?: UserEntity; 

  @OneToMany(() => PermissionEntity, permission => permission.admin, {
    cascade: true,
    eager: true
  })
  permissions: PermissionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
 