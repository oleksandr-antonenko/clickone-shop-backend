import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { AdminEntity } from '../entities/admin.entity';
import { PermissionEntity, ResourceType, PermissionAction } from '../entities/permission.entity';
import { UpdatePermissionsDto } from '../dto/update-permissions.dto';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}


  async validateSuperAdminLimit(): Promise<void> {
    const superAdmins = await this.adminRepository.find({
      where: { isSuperAdmin: true, status: 'active' }
    });

    if (superAdmins.length > 1) {
      throw new BadRequestException('Only one super admin can exist in the system');
    }
  }

  async validateAdminPermissionModification(requesterAuth0Id: string, targetAdminId: string): Promise<void> {
    const requester = await this.adminRepository.findOne({
      where: { auth0Id: requesterAuth0Id }
    });

    if (!requester) {
      throw new NotFoundException('Requester admin not found');
    }

    if (!requester.isSuperAdmin && !requester.roles.includes('admin')) {
      throw new ForbiddenException('Only super admins and admins can modify admin permissions');
    }

    if (requester.id === targetAdminId) {
      throw new BadRequestException('Admins cannot modify their own permissions');
    }

    const targetAdmin = await this.adminRepository.findOne({
      where: { id: targetAdminId }
    });

    if (!targetAdmin) {
      throw new NotFoundException('Target admin not found');
    }

    if (targetAdmin.isSuperAdmin && !requester.isSuperAdmin) {
      throw new ForbiddenException('Only super admins can modify super admin permissions');
    }

    if (targetAdmin.isSuperAdmin) {
      const superAdmins = await this.adminRepository.find({
        where: { isSuperAdmin: true, status: 'active' }
      });

      if (superAdmins.length === 1) {
        throw new BadRequestException('Cannot downgrade the only super admin in the system');
      }
    }
  }


  async getAdminPermissions(adminId: string): Promise<{
    [resource in ResourceType]: {
      [action in PermissionAction]: boolean;
    };
  }> {
    this.logger.debug(`Getting permissions for admin: ${adminId}`);

    const permissions = await this.permissionRepository.find({
      where: { adminId }
    });

    const permissionsMap = {
      [ResourceType.USERS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.ADMINS]: { create: false, read: false, update: false, delete: false },
      
      [ResourceType.CUSTOMERS]: { create: false, read: false, update: false, delete: false },
      
      [ResourceType.ORDERS]: { create: false, read: false, update: false, delete: false },
      
      [ResourceType.PRODUCTS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.CATEGORIES]: { create: false, read: false, update: false, delete: false },
      [ResourceType.BRANDS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.COLLECTIONS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.FAMILIES]: { create: false, read: false, update: false, delete: false },
      [ResourceType.ATTRIBUTES]: { create: false, read: false, update: false, delete: false },
      
      [ResourceType.SETTINGS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.ANALYTICS]: { create: false, read: false, update: false, delete: false },
    };

    permissions.forEach(permission => {
      if (permissionsMap[permission.resource]) {
        permissionsMap[permission.resource][permission.action] = permission.granted;
      }
    });

    return permissionsMap;
  }


  async updateAdminPermissions(
    adminId: string, 
    updateData: UpdatePermissionsDto, 
    requesterAuth0Id?: string
  ): Promise<void> {
    this.logger.log(`Updating permissions for admin: ${adminId}`);

    if (requesterAuth0Id) {
      await this.validateAdminPermissionModification(requesterAuth0Id, adminId);
    }

    const admin = await this.adminRepository.findOne({ where: { id: adminId } });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.permissionRepository.delete({ adminId });

    const permissionsToCreate: Partial<PermissionEntity>[] = [];

    Object.entries(updateData.permissions).forEach(([resource, actions]) => {
      Object.entries(actions).forEach(([action, granted]) => {
        permissionsToCreate.push({
          adminId,
          resource: resource as ResourceType,
          action: action as PermissionAction,
          granted,
          notes: updateData.notes
        });
      });
    });

    if (permissionsToCreate.length > 0) {
      await this.permissionRepository.save(permissionsToCreate);
    }

    this.logger.log(`Permissions updated successfully for admin: ${adminId}`);
  }


  async hasPermission(adminId: string, resource: ResourceType, action: PermissionAction): Promise<boolean> {
    const permission = await this.permissionRepository.findOne({
      where: { adminId, resource, action }
    });

    return permission?.granted || false;
  }


  async hasAnyPermission(adminId: string, resource: ResourceType): Promise<boolean> {
    const permissions = await this.permissionRepository.find({
      where: { adminId, resource }
    });

    return permissions.some(p => p.granted);
  }


  async getAdminsWithPermission(resource: ResourceType, action: PermissionAction): Promise<AdminEntity[]> {
    const permissions = await this.permissionRepository.find({
      where: { resource, action, granted: true },
      relations: ['admin']
    });

    return permissions.map(p => p.admin);
  }


  async createDefaultPermissions(adminId: string, role: string): Promise<void> {
    this.logger.log(`Creating default permissions for admin: ${adminId} with role: ${role}`);

    const defaultPermissions = this.getDefaultPermissionsForRole(role);
    await this.updateAdminPermissions(adminId, { permissions: defaultPermissions });
  }


  private getDefaultPermissionsForRole(role: string): {
    [resource in ResourceType]: {
      [action in PermissionAction]: boolean;
    };
  } {
    const basePermissions = {
      [ResourceType.USERS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.ADMINS]: { create: false, read: false, update: false, delete: false },
      
      [ResourceType.CUSTOMERS]: { create: false, read: false, update: false, delete: false },
      
      [ResourceType.ORDERS]: { create: false, read: false, update: false, delete: false },
      
      [ResourceType.PRODUCTS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.CATEGORIES]: { create: false, read: false, update: false, delete: false },
      [ResourceType.BRANDS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.COLLECTIONS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.FAMILIES]: { create: false, read: false, update: false, delete: false },
      [ResourceType.ATTRIBUTES]: { create: false, read: false, update: false, delete: false },
      
      [ResourceType.SETTINGS]: { create: false, read: false, update: false, delete: false },
      [ResourceType.ANALYTICS]: { create: false, read: false, update: false, delete: false },
    };

    switch (role) {
      case 'superadmin':
        Object.keys(basePermissions).forEach(resource => {
          Object.keys(basePermissions[resource]).forEach(action => {
            basePermissions[resource][action] = true;
          });
        });
        break;

      case 'admin':
        basePermissions[ResourceType.USERS] = { create: true, read: true, update: true, delete: true };
        basePermissions[ResourceType.ADMINS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.CUSTOMERS] = { create: true, read: true, update: true, delete: true };
        basePermissions[ResourceType.ORDERS] = { create: true, read: true, update: true, delete: true };
        basePermissions[ResourceType.PRODUCTS] = { create: true, read: true, update: true, delete: true };
        basePermissions[ResourceType.CATEGORIES] = { create: true, read: true, update: true, delete: true };
        basePermissions[ResourceType.BRANDS] = { create: true, read: true, update: true, delete: true };
        basePermissions[ResourceType.COLLECTIONS] = { create: true, read: true, update: true, delete: true };
        basePermissions[ResourceType.FAMILIES] = { create: true, read: true, update: true, delete: true };
        basePermissions[ResourceType.ATTRIBUTES] = { create: true, read: true, update: true, delete: true };
        basePermissions[ResourceType.SETTINGS] = { create: false, read: true, update: true, delete: false };
        basePermissions[ResourceType.ANALYTICS] = { create: false, read: true, update: false, delete: false };
        break;

      case 'manager':
        basePermissions[ResourceType.USERS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.ADMINS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.CUSTOMERS] = { create: true, read: true, update: true, delete: false };
        basePermissions[ResourceType.ORDERS] = { create: true, read: true, update: true, delete: false };
        basePermissions[ResourceType.PRODUCTS] = { create: true, read: true, update: true, delete: false };
        basePermissions[ResourceType.CATEGORIES] = { create: true, read: true, update: true, delete: false };
        basePermissions[ResourceType.BRANDS] = { create: true, read: true, update: true, delete: false };
        basePermissions[ResourceType.COLLECTIONS] = { create: true, read: true, update: true, delete: false };
        basePermissions[ResourceType.FAMILIES] = { create: true, read: true, update: true, delete: false };
        basePermissions[ResourceType.ATTRIBUTES] = { create: true, read: true, update: true, delete: false };
        basePermissions[ResourceType.SETTINGS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.ANALYTICS] = { create: false, read: true, update: false, delete: false };
        break;

      case 'operator':
        basePermissions[ResourceType.USERS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.ADMINS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.CUSTOMERS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.ORDERS] = { create: false, read: true, update: true, delete: false };
        basePermissions[ResourceType.PRODUCTS] = { create: false, read: true, update: true, delete: false };
        basePermissions[ResourceType.CATEGORIES] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.BRANDS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.COLLECTIONS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.FAMILIES] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.ATTRIBUTES] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.SETTINGS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.ANALYTICS] = { create: false, read: true, update: false, delete: false };
        break;

      case 'viewer':
        basePermissions[ResourceType.USERS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.ADMINS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.CUSTOMERS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.ORDERS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.PRODUCTS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.CATEGORIES] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.BRANDS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.COLLECTIONS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.FAMILIES] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.ATTRIBUTES] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.SETTINGS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.ANALYTICS] = { create: false, read: true, update: false, delete: false };
        break;

      default:
        basePermissions[ResourceType.USERS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.ADMINS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.CUSTOMERS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.ORDERS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.PRODUCTS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.CATEGORIES] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.BRANDS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.COLLECTIONS] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.FAMILIES] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.ATTRIBUTES] = { create: false, read: true, update: false, delete: false };
        basePermissions[ResourceType.SETTINGS] = { create: false, read: false, update: false, delete: false };
        basePermissions[ResourceType.ANALYTICS] = { create: false, read: true, update: false, delete: false };
    }

    return basePermissions;
  }
} 