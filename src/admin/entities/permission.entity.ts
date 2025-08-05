import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique
} from 'typeorm';
import { AdminEntity } from './admin.entity';

export enum ResourceType {
  USERS = 'users',
  ADMINS = 'admins',
  CUSTOMERS = 'customers',
  ORDERS = 'orders',
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  BRANDS = 'brands',
  COLLECTIONS = 'collections',
  FAMILIES = 'families',
  ATTRIBUTES = 'attributes',
  SETTINGS = 'settings',
  ANALYTICS = 'analytics'
}

export enum PermissionAction {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete'
}

@Entity('permissions')
export class PermissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  adminId: string;

  @Column({
    type: 'enum',
    enum: ResourceType
  })
  resource: ResourceType;

  @Column({
    type: 'enum',
    enum: PermissionAction,
    name: 'actions' 
  })
  action: PermissionAction;

  @Column({ default: false })
  granted: boolean;

  @Column({ nullable: true })
  notes?: string;

  @ManyToOne(() => AdminEntity, admin => admin.permissions, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'adminId' })
  admin: AdminEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 
 