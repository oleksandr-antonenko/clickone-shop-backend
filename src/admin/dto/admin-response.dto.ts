import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AdminResponseDto {
  @Expose()
  id: string;

  @Expose()
  auth0Id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  status: string;

  @Expose()
  permissions: string[];

  @Expose()
  roles: string[];

  @Expose()
  avatar?: string;

  @Expose()
  phone?: string;

  @Expose()
  lastLoginAt?: Date;

  @Expose()
  lastActivityAt?: Date;

  @Expose()
  department?: string;

  @Expose()
  position?: string;

  @Expose()
  isSuperAdmin: boolean;

  @Expose()
  canManageAdmins: boolean;

  @Expose()
  canViewAnalytics: boolean;

  @Expose()
  canManageUsers: boolean;

  @Expose()
  canManageOrders: boolean;

  @Expose()
  canManageProducts: boolean;

  @Expose()
  canManageCustomers: boolean;

  @Expose()
  notes?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
} 
 