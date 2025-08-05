import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { ResourceType, PermissionAction } from '../entities/permission.entity';

export class UpdatePermissionsDto {
  @ApiProperty({
    description: 'Permissions object with resource as key and actions as value',
    example: {
      products: {
        create: true,
        read: true,
        update: true,
        delete: false
      },
      orders: {
        create: false,
        read: true,
        update: true,
        delete: false
      },
      customers: {
        create: false,
        read: true,
        update: false,
        delete: false
      },
      users: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      analytics: {
        create: false,
        read: true,
        update: false,
        delete: false
      },
      settings: {
        create: false,
        read: false,
        update: false,
        delete: false
      },
      admins: {
        create: false,
        read: false,
        update: false,
        delete: false
      }
    }
  })
  @IsObject()
  permissions: {
    [key in ResourceType]?: {
      [action in PermissionAction]?: boolean;
    };
  };

  @ApiProperty({
    description: 'Notes about permission changes',
    example: 'Updated permissions for new role assignment',
    required: false
  })
  @IsOptional()
  notes?: string;
} 
 