import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { CustomerResponseDto } from '../../customer/dto/customer-response.dto';
import { PaginationService } from '../../pagination/service/pagination.service';
import { PaginationQuery, PaginationResult } from '../../pagination/interface/pagination.interface';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    private readonly paginationService: PaginationService,
  ) {}


  async getAllUsers(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    role?: string, 
    status?: string
  ): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number; filters: any; pagination: any }> {
    this.logger.log(`Admin requesting users with filters: search=${search}, role=${role}, status=${status}`);
    
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.permissions', 'permissions')
      .leftJoinAndSelect('user.customer', 'customer');

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

    const paginationOptions: PaginationQuery = {
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      filters
    };

    const result: PaginationResult<UserEntity> = await this.paginationService.paginate(
      queryBuilder,
      'user',
      paginationOptions,
      filters
    );

    this.logger.log(`Admin retrieved ${result.data.length} users out of ${result.total} total`);

    return {
      users: result.data.map(user => this.mapToUserResponseDto(user)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      filters: {
        search,
        role,
        status
      },
      pagination: this.paginationService.createPaginationMeta(result)
    };
  }


  async getAllCustomers(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    status?: string, 
    segment?: string
  ): Promise<{ customers: CustomerResponseDto[]; total: number; page: number; limit: number; filters: any; pagination: any }> {
    this.logger.log(`Admin requesting customers with filters: search=${search}, status=${status}, segment=${segment}`);
    
    const queryBuilder = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('customer.addresses', 'addresses');

    const filters: Record<string, Record<string, any>> = {};

    if (search) {
      filters.email = { like: search };
      filters.firstName = { like: search };
      filters.lastName = { like: search };
    }

    if (status) {
      filters.status = { eq: status };
    }

    if (segment) {
      filters.segment = { eq: segment };
    }

    const paginationOptions: PaginationQuery = {
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      filters
    };

    const result: PaginationResult<CustomerEntity> = await this.paginationService.paginate(
      queryBuilder,
      'customer',
      paginationOptions,
      filters
    );

    this.logger.log(`Admin retrieved ${result.data.length} customers out of ${result.total} total`);

    return {
      customers: result.data.map(customer => this.mapToCustomerResponseDto(customer)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      filters: {
        search,
        status,
        segment
      },
      pagination: this.paginationService.createPaginationMeta(result)
    };
  }





  async updateCustomer(customerId: string, updateData: UpdateCustomerDto): Promise<CustomerResponseDto> {
    this.logger.log(`Admin updating customer: ${customerId}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateData)}`);

    const customer = await this.findCustomerById(customerId);
    if (!customer) {
      this.logger.warn(`Customer not found for ID: ${customerId}`);
      throw new NotFoundException('Customer not found');
    }

    Object.assign(customer, updateData);

    if (updateData.email && customer.user) {
      customer.user.email = updateData.email;
      await this.userRepository.save(customer.user);
    }

    const updatedCustomer = await this.customerRepository.save(customer);

    this.logger.log(`Admin updated customer successfully: ${customerId}`);
    return this.mapToCustomerResponseDto(updatedCustomer);
  }


  async updateUserRoles(userId: string, roles: string[]): Promise<UserResponseDto> {
    this.logger.log(`Admin updating roles for user: ${userId}`);
    this.logger.debug(`New roles: ${JSON.stringify(roles)}`);

    this.validateRoles(roles);

    const user = await this.findById(userId);
    if (!user) {
      this.logger.warn(`User not found for ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    user.roles = roles;
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Admin updated roles successfully for user: ${userId}`);
    return this.mapToUserResponseDto(updatedUser);
  }


  async grantAdminRole(userId: string): Promise<UserResponseDto> {
    this.logger.log(`Granting admin role to user: ${userId}`);

    const user = await this.findById(userId);
    if (!user) {
      this.logger.warn(`User not found for ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    if (user.roles.includes('admin')) {
      this.logger.warn(`User ${userId} already has admin role`);
      return this.mapToUserResponseDto(user);
    }

    user.roles.push('admin');
    user.status = 'active';
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Admin role granted and user activated: ${userId}`);
    return this.mapToUserResponseDto(updatedUser);
  }


  async revokeAdminRole(userId: string): Promise<UserResponseDto> {
    this.logger.log(`Revoking admin role from user: ${userId}`);

    const user = await this.findById(userId);
    if (!user) {
      this.logger.warn(`User not found for ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    if (!user.roles.includes('admin')) {
      this.logger.warn(`User ${userId} does not have admin role`);
      return this.mapToUserResponseDto(user);
    }

    user.roles = user.roles.filter(role => role !== 'admin');
    
    if (user.roles.length === 0) {
      user.roles = ['user'];
    }
    
    if (!user.roles.includes('admin')) {
      user.status = 'inactive';
    }
    
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Admin role revoked and user deactivated: ${userId}`);
    return this.mapToUserResponseDto(updatedUser);
  }
  
  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['permissions', 'customer'],
    });
  }


  async findUserByEmail(email: string): Promise<UserResponseDto | null> {
    this.logger.log(`🔍 Finding user by email: ${email}`);

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['permissions', 'customer'],
    });

    if (!user) {
      this.logger.warn(`User not found with email: ${email}`);
      return null;
    }

    this.logger.log(`User found: ${user.id} (${user.email})`);
    return this.mapToUserResponseDto(user);
  }


  async findUserByAuth0Id(auth0Id: string): Promise<UserResponseDto | null> {
    this.logger.log(`Finding user by Auth0 ID: ${auth0Id}`);

    const user = await this.userRepository.findOne({
      where: { auth0Id },
      relations: ['permissions', 'customer'],
    });

    if (!user) {
      this.logger.warn(`User not found with Auth0 ID: ${auth0Id}`);
      return null;
    }

    this.logger.log(`User found: ${user.id} (${user.email})`);
    return this.mapToUserResponseDto(user);
  }

  async findCustomerById(id: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findOne({
      where: { id },
      relations: ['user', 'addresses'],
    });
  }

  private validateRoles(roles: string[]): void {
    if (!Array.isArray(roles)) {
      throw new BadRequestException('Roles must be an array');
    }
    
    if (roles.length === 0) {
      throw new BadRequestException('User must have at least one role');
    }

    for (const role of roles) {
      this.validateRole(role);
    }
  }


  private validateRole(role: string): void {
    if (!role || typeof role !== 'string') {
      throw new BadRequestException('Role must be a non-empty string');
    }

    const validRoles = ['admin', 'manager', 'user', 'moderator'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}`);
    }
  }


  private mapToUserResponseDto(user: UserEntity): UserResponseDto {
    return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
  }


  private mapToCustomerResponseDto(customer: CustomerEntity): CustomerResponseDto {
    return plainToClass(CustomerResponseDto, customer, { excludeExtraneousValues: true });
  }


  async getUserStatistics(): Promise<{
    totalUsers: number;
    administrators: number;
    managers: number;
    activeUsers: number;
    inactiveUsers: number;
    lastUpdated: Date;
  }> {
    this.logger.log('Getting user statistics');

    const totalUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: 'active' })
      .getCount();

    const administrators = await this.userRepository
      .createQueryBuilder('user')
      .where("(user.roles LIKE '%admin%' OR user.roles LIKE '%superadmin%') AND user.status = :status", { status: 'active' })
      .getCount();

    const managers = await this.userRepository
      .createQueryBuilder('user')
      .where("user.roles LIKE '%manager%' AND user.status = :status", { status: 'active' })
      .getCount();

    const activeUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: 'active' })
      .getCount();

    const inactiveUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.status = :status', { status: 'inactive' })
      .getCount();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyActiveUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.lastLoginAt >= :date', { date: thirtyDaysAgo })
      .getCount();

    const newUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :date', { date: thirtyDaysAgo })
      .getCount();

    this.logger.log(`Additional stats - Recently active: ${recentlyActiveUsers}, New users: ${newUsers}`);

    const statistics = {
      totalUsers,
      administrators,
      managers,
      activeUsers,
      inactiveUsers,
      lastUpdated: new Date()
    };

    this.logger.log(`User statistics retrieved: ${JSON.stringify(statistics)}`);
    return statistics;
  }
} 