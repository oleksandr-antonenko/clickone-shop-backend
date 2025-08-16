import { Controller, Get, Patch, Query, UseGuards, Param, Body, Req, Post, Delete } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger';
import { AdminService } from '../service/admin.service';
import { AdminManagementService } from '../service/admin-management.service';
import { PermissionService } from '../service/permission.service';
import { AdminUsersResponseDto } from '../dto/admin-users-response.dto';
import { AdminAdminsResponseDto } from '../dto/admin-admins-response.dto';
import { AdminUpdateUserRolesDto } from '../dto/update-user-roles.dto';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { UpdatePermissionsDto } from '../dto/update-permissions.dto';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { CustomerResponseDto } from '../../customer/dto/customer-response.dto';
import { AdminResponseDto } from '../dto/admin-response.dto';
import { ResourceType, PermissionAction } from '../entities/permission.entity';
import { CheckPermission } from '../decorators/check-permission.decorator';
import { PermissionGuard } from '../guards/permission.guard';
import { ForbiddenException } from '@nestjs/common';

@ApiTags('Admin Management')
@Controller('admin')
@ApiBearerAuth()
@UseGuards(PermissionGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly adminManagementService: AdminManagementService,
    private readonly permissionService: PermissionService,
  ) {}

  @Get('users')
  @CheckPermission(ResourceType.USERS, PermissionAction.READ)
  @ApiOperation({ 
    summary: 'Get all users (Admin only)',
    description: 'Retrieve all users with pagination and advanced filtering. Admin access required.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Page number (default: 1)',
    type: Number
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Items per page (default: 10)',
    type: Number
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    description: 'Search by email, firstName, or lastName',
    type: String
  })
  @ApiQuery({ 
    name: 'role', 
    required: false, 
    description: 'Filter by role',
    enum: ['superadmin', 'admin', 'manager', 'operator', 'viewer']
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    description: 'Filter by status',
    enum: ['active', 'inactive']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Users retrieved successfully',
    type: AdminUsersResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Admin access required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions'
  })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string
  ): Promise<AdminUsersResponseDto> {
    return this.adminService.getAllUsers(page, limit, search, role, status);
  }





  @Get('admins')
  @CheckPermission(ResourceType.ADMINS, PermissionAction.READ)
  @ApiOperation({ 
    summary: 'Get all admins (Super Admin only)',
    description: 'Retrieve all admins with pagination and advanced filtering. Super Admin access required.'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Page number (default: 1)',
    type: Number
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Items per page (default: 10)',
    type: Number
  })
  @ApiQuery({ 
    name: 'search', 
    required: false, 
    description: 'Search by email, firstName, or lastName',
    type: String
  })
  @ApiQuery({ 
    name: 'role', 
    required: false, 
    description: 'Filter by role',
    enum: ['superadmin', 'admin', 'manager', 'operator', 'viewer']
  })
  @ApiQuery({ 
    name: 'status', 
    required: false, 
    description: 'Filter by status',
    enum: ['active', 'inactive', 'suspended']
  })
  @ApiQuery({ 
    name: 'department', 
    required: false, 
    description: 'Filter by department',
    enum: ['IT', 'Sales', 'Support', 'Management']
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Admins retrieved successfully',
    type: AdminAdminsResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Super Admin access required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions'
  })
  async getAllAdmins(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
    @Query('department') department?: string
  ): Promise<AdminAdminsResponseDto> {
    return this.adminManagementService.getAllAdmins(page, limit, search, role, status, department);
  }

  @Get('admins/all')
  @ApiOperation({
    summary: 'Get all admins (for debugging)',
    description: 'Get all admins in the system. This endpoint is for debugging purposes.'
  })
  @ApiResponse({
    status: 200,
    description: 'All admins retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          auth0Id: { type: 'string' },
          email: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          roles: { type: 'array', items: { type: 'string' } },
          status: { type: 'string' },
          isSuperAdmin: { type: 'boolean' }
        }
      }
    }
  })
  async getAllAdminsSimple() {
    return this.adminManagementService.getAllAdminsSimple();
  }

  @Get('admins/statistics')
  @CheckPermission(ResourceType.ADMINS, PermissionAction.READ)
  @ApiOperation({ 
    summary: 'Get admin statistics (Super Admin only)',
    description: 'Retrieve statistics for all admins including total admins, active admins, and role distribution'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Admin statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalAdmins: {
          type: 'number',
          example: 3,
          description: 'Total number of admins'
        },
        activeAdmins: {
          type: 'number',
          example: 3,
          description: 'Number of active admins'
        },
        superAdmins: {
          type: 'number',
          example: 1,
          description: 'Number of super admins'
        },
        regularAdmins: {
          type: 'number',
          example: 1,
          description: 'Number of regular admins'
        },
        managers: {
          type: 'number',
          example: 1,
          description: 'Number of managers'
        },
        operators: {
          type: 'number',
          example: 0,
          description: 'Number of operators'
        },
        roles: {
          type: 'object',
          properties: {
            superadmin: { type: 'number', example: 1 },
            admin: { type: 'number', example: 1 },
            manager: { type: 'number', example: 1 },
            operator: { type: 'number', example: 0 },
            viewer: { type: 'number', example: 0 }
          }
        },
        lastUpdated: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
          description: 'When statistics were last updated'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Super Admin access required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions'
  })
  async getAdminStatistics() {
    return this.adminManagementService.getAdminStatistics();
  }

  @Get('users/statistics')
  @CheckPermission(ResourceType.USERS, PermissionAction.READ) 
  @ApiOperation({ 
    summary: 'Get user statistics (Admin only)',
    description: 'Retrieve statistics for all users including total users, administrators, managers, and active users'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalUsers: {
          type: 'number',
          example: 2,
          description: 'Total number of users'
        },
        administrators: {
          type: 'number',
          example: 1,
          description: 'Number of administrators'
        },
        managers: {
          type: 'number',
          example: 1,
          description: 'Number of managers'
        },
        activeUsers: {
          type: 'number',
          example: 2,
          description: 'Number of active users'
        },
        inactiveUsers: {
          type: 'number',
          example: 0,
          description: 'Number of inactive users'
        },
        lastUpdated: {
          type: 'string',
          format: 'date-time',
          example: '2024-01-15T10:30:00.000Z',
          description: 'When statistics were last updated'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Admin access required'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Insufficient permissions'
  })
  async getUserStatistics() {
    return this.adminService.getUserStatistics();
  }

  @Get('admins/:id/permissions')
  @CheckPermission(ResourceType.ADMINS, PermissionAction.READ)
  @ApiOperation({
    summary: 'Get admin permissions (Super Admin and Admin only)',
    description: 'Retrieve all permissions for a specific admin. Super admins and admins can view permissions.'
  })
  @ApiParam({
    name: 'id',
    description: 'Admin ID',
    example: 'f38c9d3a-5ed2-4eb5-9481-ba1ee73f838d'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin permissions retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        products: {
          type: 'object',
          properties: {
            create: { type: 'boolean' },
            read: { type: 'boolean' },
            update: { type: 'boolean' },
            delete: { type: 'boolean' }
          }
        },
        orders: {
          type: 'object',
          properties: {
            create: { type: 'boolean' },
            read: { type: 'boolean' },
            update: { type: 'boolean' },
            delete: { type: 'boolean' }
          }
        },
        customers: {
          type: 'object',
          properties: {
            create: { type: 'boolean' },
            read: { type: 'boolean' },
            update: { type: 'boolean' },
            delete: { type: 'boolean' }
          }
        },
        users: {
          type: 'object',
          properties: {
            create: { type: 'boolean' },
            read: { type: 'boolean' },
            update: { type: 'boolean' },
            delete: { type: 'boolean' }
          }
        },
        analytics: {
          type: 'object',
          properties: {
            create: { type: 'boolean' },
            read: { type: 'boolean' },
            update: { type: 'boolean' },
            delete: { type: 'boolean' }
          }
        },
        settings: {
          type: 'object',
          properties: {
            create: { type: 'boolean' },
            read: { type: 'boolean' },
            update: { type: 'boolean' },
            delete: { type: 'boolean' }
          }
        },
        admins: {
          type: 'object',
          properties: {
            create: { type: 'boolean' },
            read: { type: 'boolean' },
            update: { type: 'boolean' },
            delete: { type: 'boolean' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Super Admin or Admin access required'
  })
  @ApiResponse({
    status: 404,
    description: 'Admin not found'
  })
  async getAdminPermissions(@Param('id') adminId: string) {
    return this.permissionService.getAdminPermissions(adminId);
  }

  @Patch('admins/:id/permissions')
  @CheckPermission(ResourceType.ADMINS, PermissionAction.UPDATE)
  @ApiOperation({
    summary: 'Update admin permissions (Super Admin and Admin only)',
    description: 'Update permissions for a specific admin. Super admins and admins can modify permissions.'
  })
  @ApiParam({ name: 'id', description: 'Admin ID', example: 'f38c9d3a-5ed2-4eb5-9481-ba1ee73f838d' })
  @ApiBody({
    type: UpdatePermissionsDto,
    description: 'Permissions to update',
    examples: {
      superAdmin: {
        summary: 'Super Admin Permissions',
        description: 'Full permissions for super admin',
        value: {
          permissions: {
            products: { create: true, read: true, update: true, delete: true },
            orders: { create: true, read: true, update: true, delete: true },
            customers: { create: true, read: true, update: true, delete: true },
            users: { create: true, read: true, update: true, delete: true },
            analytics: { create: true, read: true, update: true, delete: true },
            settings: { create: true, read: true, update: true, delete: true },
            admins: { create: true, read: true, update: true, delete: true }
          },
          notes: 'Super admin permissions'
        }
      },
      admin: {
        summary: 'Admin Permissions',
        description: 'Standard admin permissions',
        value: {
          permissions: {
            products: { create: true, read: true, update: true, delete: true },
            orders: { create: true, read: true, update: true, delete: true },
            customers: { create: true, read: true, update: true, delete: true },
            users: { create: true, read: true, update: true, delete: true },
            analytics: { create: true, read: true, update: true, delete: true },
            settings: { create: false, read: true, update: false, delete: false },
            admins: { create: false, read: true, update: false, delete: false }
          },
          notes: 'Standard admin permissions'
        }
      },
      manager: {
        summary: 'Manager Permissions',
        description: 'Limited manager permissions',
        value: {
          permissions: {
            products: { create: true, read: true, update: true, delete: false },
            orders: { create: true, read: true, update: true, delete: false },
            customers: { create: true, read: true, update: true, delete: false },
            users: { create: false, read: true, update: false, delete: false },
            analytics: { create: false, read: true, update: false, delete: false },
            settings: { create: false, read: false, update: false, delete: false },
            admins: { create: false, read: false, update: false, delete: false }
          },
          notes: 'Manager permissions'
        }
      }
    }
  })
  @ApiResponse({ status: 200, description: 'Permissions updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid permissions data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Super Admin or Admin access required' })
  @ApiResponse({ status: 403, description: 'Forbidden - Only super admins and admins can modify admin permissions' })
  @ApiResponse({ status: 404, description: 'Admin not found' })
  async updateAdminPermissions(
    @Param('id') adminId: string,
    @Body() updatePermissionsDto: UpdatePermissionsDto,
    @Req() req: any
  ): Promise<void> {
    return this.permissionService.updateAdminPermissions(
      adminId, 
      updatePermissionsDto, 
      req.user?.sub
    );
  }

  @Post('admins')
  @UseGuards(PermissionGuard)
  @ApiOperation({
    summary: 'Create admin (Development only)',
    description: 'Create a new admin user. This endpoint should be disabled in production.'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        auth0Id: {
          type: 'string',
          example: 'google-oauth2|107401608251618661953',
          description: 'Auth0 user ID'
        },
        email: {
          type: 'string',
          example: 'admin@example.com',
          description: 'Admin email'
        },
        firstName: {
          type: 'string',
          example: 'John',
          description: 'Admin first name'
        },
        lastName: {
          type: 'string',
          example: 'Doe',
          description: 'Admin last name'
        },
        roles: {
          type: 'array',
          items: { type: 'string' },
          example: ['admin'],
          description: 'Admin roles'
        }
      },
      required: ['auth0Id', 'email', 'firstName', 'lastName']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'Admin created successfully',
    type: AdminResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid admin data'
  })
  @ApiResponse({
    status: 409,
    description: 'Admin already exists'
  })
  async createAdmin(@Body() createAdminData: {
    auth0Id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles?: string[];
  }) {
    return this.adminManagementService.createAdmin(createAdminData);
  }

  @Patch('customers/:id')
  @CheckPermission(ResourceType.CUSTOMERS, PermissionAction.UPDATE)
  @ApiOperation({
    summary: 'Update customer data (Admin only)',
    description: 'Update customer information. Admin access required.'
  })
  @ApiParam({
    name: 'id',
    description: 'Customer ID',
    example: 'f38c9d3a-5ed2-4eb5-9481-ba1ee73f838d'
  })
  @ApiBody({
    type: UpdateCustomerDto,
    description: 'Customer data to update',
    examples: {
      basic: {
        summary: 'Update basic info',
        description: 'Update customer basic information',
        value: {
          firstName: 'John',
          lastName: 'Doe',
          phone: '+380501234567',
          status: 'active'
        }
      },
      segment: {
        summary: 'Change customer segment',
        description: 'Update customer segment to VIP',
        value: {
          segment: 'vip',
          tags: ['vip', 'loyal']
        }
      },
      status: {
        summary: 'Block customer',
        description: 'Block customer account',
        value: {
          status: 'blocked'
        }
      },
      preferences: {
        summary: 'Update preferences',
        description: 'Update customer preferences',
        value: {
          preferredLanguage: 'uk',
          preferredCurrency: 'UAH',
          marketingConsent: true
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    type: CustomerResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid customer data'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions'
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found'
  })
  async updateCustomer(
    @Param('id') customerId: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ): Promise<CustomerResponseDto> {
    return this.adminService.updateCustomer(customerId, updateCustomerDto);
  }

  @Patch('users/:id/roles')
  @CheckPermission(ResourceType.USERS, PermissionAction.UPDATE)
  @ApiOperation({
    summary: 'Update user roles (Admin only)',
    description: 'Update the roles for a specific user. Replace all existing roles with the new array. Admin access required.'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'f38c9d3a-5ed2-4eb5-9481-ba1ee73f838d'
  })
  @ApiBody({
    type: AdminUpdateUserRolesDto,
    description: 'Roles to assign to the user',
    examples: {
      admin: {
        summary: 'Make user admin',
        description: 'Assign admin role to user',
        value: {
          roles: ['admin']
        }
      },
      manager: {
        summary: 'Make user manager',
        description: 'Assign manager role to user',
        value: {
          roles: ['manager']
        }
      },
      multiple: {
        summary: 'Multiple roles',
        description: 'Assign multiple roles to user',
        value: {
          roles: ['admin', 'manager', 'user']
        }
      },
      user: {
        summary: 'Make user regular user',
        description: 'Assign only user role',
        value: {
          roles: ['user']
        }
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'User roles updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid roles data'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  async updateUserRoles(
    @Param('id') userId: string,
    @Body() updateRolesDto: AdminUpdateUserRolesDto
  ): Promise<UserResponseDto> {
    return this.adminService.updateUserRoles(userId, updateRolesDto.roles);
  }

  @Post('users/:userId/grant-admin')
  @ApiOperation({
    summary: 'Grant admin role to user',
    description: 'Grant admin role to a regular user. This will allow them to access admin features.'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin role granted successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user data'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions'
  })
  async grantAdminRole(@Param('userId') userId: string) {
    return this.adminService.grantAdminRole(userId);
  }

  @Delete('users/:userId/revoke-admin')
  @ApiOperation({
    summary: 'Revoke admin role from user',
    description: 'Remove admin role from a user. This will restrict their access to admin features.'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin role revoked successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user data'
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions'
  })
  async revokeAdminRole(@Param('userId') userId: string) {
    return this.adminService.revokeAdminRole(userId);
  }

  @Get('check-admin')
  @UseGuards(PermissionGuard) 
  @ApiOperation({
    summary: 'Check if current user is admin',
    description: 'Check if the authenticated user is registered as an admin'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin check result',
    schema: {
      type: 'object',
      properties: {
        isAdmin: {
          type: 'boolean',
          example: true,
          description: 'Whether the user is an admin'
        },
        auth0Id: {
          type: 'string',
          example: 'google-oauth2|107401608251618661953',
          description: 'Auth0 user ID'
        },
        adminData: {
          type: 'object',
          nullable: true,
          description: 'Admin data if user is admin'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  async checkAdmin(@Req() req: any) {
    const auth0Id = req.user?.sub;
    if (!auth0Id) {
      throw new ForbiddenException('Authentication required');
    }

    const isAdmin = await this.adminManagementService.isAdmin(auth0Id);
    const adminData = isAdmin ? await this.adminManagementService.findByAuth0Id(auth0Id) : null;

    return {
      isAdmin,
      auth0Id,
      adminData: adminData ? {
        id: adminData.id,
        email: adminData.email,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        roles: adminData.roles,
        status: adminData.status,
        isSuperAdmin: adminData.isSuperAdmin
      } : null
    };
  }

  @Get('admins/check/:auth0Id')
  @ApiOperation({
    summary: 'Check if admin exists',
    description: 'Check if an admin exists with the given Auth0 ID'
  })
  @ApiParam({
    name: 'auth0Id',
    description: 'Auth0 user ID',
    example: 'google-oauth2|107401608251618661953'
  })
  @ApiResponse({
    status: 200,
    description: 'Admin check result',
    schema: {
      type: 'object',
      properties: {
        exists: { type: 'boolean', example: true },
        admin: { type: 'object', nullable: true }
      }
    }
  })
  async checkAdminExists(@Param('auth0Id') auth0Id: string) {
    const admin = await this.adminManagementService.findByAuth0Id(auth0Id);
    return {
      exists: !!admin,
      admin: admin ? this.adminManagementService.mapToResponseDto(admin) : null
    };
  }

  @Get('users/me')
  @ApiOperation({
    summary: 'Get current user info (Admin only)',
    description: 'Get information about the currently authenticated user. Useful for checking roles and permissions.'
  })
  @ApiResponse({
    status: 200,
    description: 'Current user information retrieved successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized'
  })
  async getCurrentUser(@Req() req: any) {
    const auth0Id = req.user?.sub;
    if (!auth0Id) {
      throw new ForbiddenException('Authentication required');
    }
    return this.adminService.findUserByAuth0Id(auth0Id);
  }

  @Get('users/find-by-email')
  @CheckPermission(ResourceType.USERS, PermissionAction.READ)
  @ApiOperation({
    summary: 'Find user by email (Admin only)',
    description: 'Find a user by email address. Useful for granting admin roles.'
  })
  @ApiQuery({
    name: 'email',
    required: true,
    description: 'User email address',
    type: String
  })
  @ApiResponse({
    status: 200,
    description: 'User found successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Admin access required'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions'
  })
  async findUserByEmail(@Query('email') email: string) {
    return this.adminService.findUserByEmail(email);
  }
} 