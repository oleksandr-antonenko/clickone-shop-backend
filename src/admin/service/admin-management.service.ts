import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { AdminEntity } from '../entities/admin.entity';
import { AdminResponseDto } from '../dto/admin-response.dto';
import { PaginationService } from '../../pagination/service/pagination.service';
import { PaginationQuery, PaginationResult } from '../../pagination/interface/pagination.interface';
import { PermissionService } from './permission.service';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AdminManagementService {
  private readonly logger = new Logger(AdminManagementService.name);

  constructor(
    @InjectRepository(AdminEntity)
    private readonly adminRepository: Repository<AdminEntity>,
    private readonly paginationService: PaginationService,
    private readonly permissionService: PermissionService,
  ) {}


  async getAllAdmins(
    page: number = 1,
    limit: number = 10,
    search?: string,
    role?: string,
    status?: string,
    department?: string
  ): Promise<{ admins: AdminResponseDto[]; total: number; page: number; limit: number; filters: any; pagination: any }> {
    
    const queryBuilder = this.adminRepository.createQueryBuilder('admin');

    const filters: Record<string, Record<string, any>> = {};

    if (search) {
      filters.email = { like: search };
      filters.firstName = { like: search };
      filters.lastName = { like: search };
    }

    if (role) {
      filters.roles = { in: [role] };
    }

    if (status) {
      filters.status = { eq: status };
    }

    if (department) {
      filters.department = { eq: department };
    }

    const paginationOptions: PaginationQuery = {
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      filters
    };

    const result: PaginationResult<AdminEntity> = await this.paginationService.paginate(
      queryBuilder,
      'admin',
      paginationOptions,
      filters
    );

    return {
      admins: result.data.map(admin => this.mapToResponseDto(admin)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      filters: {
        search,
        role,
        status,
        department
      },
      pagination: this.paginationService.createPaginationMeta(result)
    };
  }


  async getAllAdminsSimple(): Promise<any[]> {
    this.logger.log('Getting all admins (simple)');
    
    const admins = await this.adminRepository.find({
      select: ['id', 'auth0Id', 'email', 'firstName', 'lastName', 'roles', 'status', 'isSuperAdmin']
    });

    this.logger.log(`Retrieved ${admins.length} admins`);
    return admins;
  }


  async findByAuth0Id(auth0Id: string): Promise<AdminEntity | null> {
    return this.adminRepository.findOne({
      where: { auth0Id }
    });
  }


  async findById(id: string): Promise<AdminEntity | null> {
    return this.adminRepository.findOne({
      where: { id }
    });
  }


  async createAdmin(adminData: {
    auth0Id: string;
    email: string;
    firstName: string;
    lastName: string;
    roles?: string[];
    permissions?: string[];
    department?: string;
    position?: string;
    phone?: string;
    avatar?: string;
  }): Promise<AdminResponseDto> {
    this.logger.log(`🏗️ Creating new admin: ${adminData.email}`);

    const existingAdmin = await this.findByAuth0Id(adminData.auth0Id);
    if (existingAdmin) {
      return this.mapToResponseDto(existingAdmin);
    }

    if (adminData.roles?.includes('superadmin')) {
      await this.permissionService.validateSuperAdminLimit();
    }

    const admin = this.adminRepository.create({
      auth0Id: adminData.auth0Id,
      email: adminData.email,
      firstName: adminData.firstName,
      lastName: adminData.lastName,
      roles: adminData.roles || ['admin'],
      status: 'active',
      lastLoginAt: new Date(),
      lastActivityAt: new Date(),
      isSuperAdmin: adminData.roles?.includes('superadmin') || false,
      canManageAdmins: adminData.roles?.includes('superadmin') || false,
      canViewAnalytics: true,
      canManageUsers: adminData.permissions?.includes('manage_users') || false,
      canManageOrders: adminData.permissions?.includes('manage_orders') || false,
      canManageProducts: adminData.permissions?.includes('manage_products') || false,
      canManageCustomers: adminData.permissions?.includes('manage_customers') || false,
      department: adminData.department,
      position: adminData.position,
      phone: adminData.phone,
      avatar: adminData.avatar,
    });

    const savedAdmin = await this.adminRepository.save(admin);
    this.logger.log(`Admin created successfully: ${savedAdmin.id}`);

    if (adminData.roles && adminData.roles.length > 0) {
      await this.permissionService.createDefaultPermissions(savedAdmin.id, adminData.roles[0]);
    }

    return this.mapToResponseDto(savedAdmin);
  }


  async updateAdmin(id: string, updateData: Partial<AdminEntity>): Promise<AdminResponseDto> {
    this.logger.log(`Updating admin: ${id}`);

    const admin = await this.findById(id);
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (updateData.roles) {
      updateData.isSuperAdmin = updateData.roles.includes('super_admin');
      updateData.canManageAdmins = updateData.roles.includes('super_admin');
    }

    Object.assign(admin, updateData);
    const updatedAdmin = await this.adminRepository.save(admin);

    this.logger.log(`Admin updated successfully: ${id}`);
    return this.mapToResponseDto(updatedAdmin);
  }


  async updateLastLogin(auth0Id: string): Promise<void> {
    this.logger.debug(`Updating last login for admin: ${auth0Id}`);

    const admin = await this.findByAuth0Id(auth0Id);
    if (admin) {
      admin.lastLoginAt = new Date();
      admin.lastActivityAt = new Date();
      await this.adminRepository.save(admin);
      this.logger.debug(`Last login updated for admin: ${admin.id}`);
    }
  }


  async isAdmin(auth0Id: string): Promise<boolean> {
    const admin = await this.findByAuth0Id(auth0Id);
    return admin !== null && admin.status === 'active';
  }

  async hasPermission(auth0Id: string, permission: string): Promise<boolean> {
    const admin = await this.findByAuth0Id(auth0Id);
    if (!admin || admin.status !== 'active') {
      return false;
    }


    const hasSpecificPermission = admin.permissions.some(p => 
      p.granted && p.resource === permission
    );

    return hasSpecificPermission || admin.isSuperAdmin;
  }


  async getAdminStatistics(): Promise<{
    totalAdmins: number;
    activeAdmins: number;
    superAdmins: number;
    regularAdmins: number;
    managers: number;
    operators: number;
    roles: {
      superadmin: number;
      admin: number;
      manager: number;
      operator: number;
      viewer: number;
    };
    lastUpdated: Date;
  }> {
    this.logger.log('Getting admin statistics');


    const totalAdmins = await this.adminRepository.count();

    const activeAdmins = await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.status = :status', { status: 'active' })
      .getCount();

    const superAdmins = await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.isSuperAdmin = :isSuperAdmin', { isSuperAdmin: true })
      .getCount();

    const regularAdmins = await this.adminRepository
      .createQueryBuilder('admin')
      .where("admin.roles LIKE '%admin%' AND admin.isSuperAdmin = :isSuperAdmin", { isSuperAdmin: false })
      .getCount();

    const managers = await this.adminRepository
      .createQueryBuilder('admin')
      .where("admin.roles LIKE '%manager%'")
      .getCount();

    const operators = await this.adminRepository
      .createQueryBuilder('admin')
      .where("admin.roles LIKE '%operator%'")
      .getCount();

    const superadminRole = await this.adminRepository
      .createQueryBuilder('admin')
      .where("admin.roles LIKE '%superadmin%'")
      .getCount();

    const adminRole = await this.adminRepository
      .createQueryBuilder('admin')
      .where("admin.roles LIKE '%admin%'")
      .getCount();

    const managerRole = await this.adminRepository
      .createQueryBuilder('admin')
      .where("admin.roles LIKE '%manager%'")
      .getCount();

    const operatorRole = await this.adminRepository
      .createQueryBuilder('admin')
      .where("admin.roles LIKE '%operator%'")
      .getCount();

    const viewerRole = await this.adminRepository
      .createQueryBuilder('admin')
      .where("admin.roles LIKE '%viewer%'")
      .getCount();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentlyActiveAdmins = await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.lastActivityAt >= :date', { date: sevenDaysAgo })
      .getCount();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newAdmins = await this.adminRepository
      .createQueryBuilder('admin')
      .where('admin.createdAt >= :date', { date: thirtyDaysAgo })
      .getCount();

    this.logger.log(`Additional admin stats - Recently active: ${recentlyActiveAdmins}, New admins: ${newAdmins}`);

    const statistics = {
      totalAdmins,
      activeAdmins,
      superAdmins,
      regularAdmins,
      managers,
      operators,
      roles: {
        superadmin: superadminRole,
        admin: adminRole,
        manager: managerRole,
        operator: operatorRole,
        viewer: viewerRole
      },
      lastUpdated: new Date()
    };

    this.logger.log(`Admin statistics retrieved: ${JSON.stringify(statistics)}`);
    return statistics;
  }


  public mapToResponseDto(admin: AdminEntity): AdminResponseDto {
    return plainToClass(AdminResponseDto, admin, { excludeExtraneousValues: true });
  }
}