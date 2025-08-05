import { SetMetadata } from '@nestjs/common';
import { ResourceType, PermissionAction } from '../entities/permission.entity';

export const PERMISSION_KEY = 'permission';

export interface PermissionMetadata {
  resource: ResourceType;
  action: PermissionAction;
}

export const CheckPermission = (resource: ResourceType, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { resource, action }); 
 