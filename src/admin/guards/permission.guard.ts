import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY, PermissionMetadata } from '../decorators/check-permission.decorator';
import { AdminManagementService } from '../service/admin-management.service';
import { UserService } from '../../user/service/user.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  private readonly logger = new Logger(PermissionGuard.name);

  constructor(
    private reflector: Reflector,
    private adminManagementService: AdminManagementService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissionMetadata = this.reflector.getAllAndOverride<PermissionMetadata>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!permissionMetadata) {
      this.logger.debug('No permission check required for this endpoint');
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user?.sub) {
      this.logger.warn('No Auth0 ID found in request');
      throw new ForbiddenException('Authentication required');
    }

    const { resource, action } = permissionMetadata;
    
    this.logger.debug(`Checking permission: ${resource}.${action} for user: ${user.sub}`);

    const isAdminInAdminsTable = await this.adminManagementService.isAdmin(user.sub);
    const userEntity = await this.userService.findByAuth0Id(user.sub);
    const isAdminInUsersTable = userEntity && userEntity.roles.includes('admin');
    
    const isAdmin = isAdminInAdminsTable || isAdminInUsersTable;
    
    this.logger.debug(`User ${user.sub} isAdmin check result: ${isAdmin} (admins table: ${isAdminInAdminsTable}, users table: ${isAdminInUsersTable})`);
    
    if (!isAdmin) {
      this.logger.warn(`User ${user.sub} is not an admin`);
      throw new ForbiddenException('Admin access required');
    }

    if (isAdminInUsersTable) {
      this.logger.debug(`User ${user.sub} has admin role in users table, granting permission: ${resource}.${action}`);
      return true;
    }

    const hasPermission = await this.adminManagementService.hasPermission(user.sub, `${resource}.${action}`);
    this.logger.debug(`User ${user.sub} hasPermission check result: ${hasPermission} for ${resource}.${action}`);
    
    if (!hasPermission) {
      this.logger.warn(`User ${user.sub} lacks permission: ${resource}.${action}`);
      throw new ForbiddenException(`Insufficient permissions: ${resource}.${action} required`);
    }

    this.logger.debug(`Permission granted: ${resource}.${action} for user: ${user.sub}`);
    return true;
  }
} 
 