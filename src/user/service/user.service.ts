import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';
import { RequestUser } from '../interface/request-user.interface';
import { plainToClass } from 'class-transformer';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getCurrentUserProfile(user: RequestUser): Promise<UserResponseDto> {
    const auth0Id = user?.sub;
    
    if (!auth0Id) {
      this.logger.warn('Auth0 ID not found in request user object');
      throw new UnauthorizedException('Auth0 ID not found in request');
    }

    this.logger.debug(`Getting profile for Auth0 ID: ${auth0Id}`);
    
    const userEntity = await this.findByAuth0Id(auth0Id);
    if (!userEntity) {
      this.logger.warn(`User not found for Auth0 ID: ${auth0Id}`);
      throw new NotFoundException('User not found');
    }

    this.logger.debug(`Profile retrieved successfully for user: ${userEntity.id}`);
    return this.mapToResponseDto(userEntity);
  }

  async getUserLoginInfo(user: RequestUser): Promise<{
    lastLoginAt?: Date;
    daysSinceLastLogin: number;
    isFirstLogin: boolean;
  }> {
    const auth0Id = user?.sub;
    
    if (!auth0Id) {
      this.logger.warn('Auth0 ID not found in request user object');
      throw new UnauthorizedException('Auth0 ID not found in request');
    }

    this.logger.debug(`Getting login info for Auth0 ID: ${auth0Id}`);
    
    const userEntity = await this.findByAuth0Id(auth0Id);
    if (!userEntity) {
      this.logger.warn(`User not found for Auth0 ID: ${auth0Id}`);
      throw new NotFoundException('User not found');
    }

    const now = new Date();
    const lastLogin = userEntity.lastLoginAt;
    
    let daysSinceLastLogin = 0;
    let isFirstLogin = false;

    if (lastLogin) {
      const timeDiff = now.getTime() - lastLogin.getTime();
      daysSinceLastLogin = Math.floor(timeDiff / (1000 * 3600 * 24));
    } else {
      isFirstLogin = true;
    }

    this.logger.debug(`Login info retrieved for user: ${userEntity.id}, days since last login: ${daysSinceLastLogin}`);

    return {
      lastLoginAt: lastLogin,
      daysSinceLastLogin,
      isFirstLogin
    };
  }

  async updateUserRoles(userId: string, roles: string[]): Promise<UserResponseDto> {
    this.logger.log(`Updating roles for user: ${userId}`);
    this.logger.debug(`New roles: ${JSON.stringify(roles)}`);

    this.validateRoles(roles);

    const user = await this.findById(userId);
    if (!user) {
      this.logger.warn(`User not found for ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    user.roles = roles;
    const updatedUser = await this.userRepository.save(user);

    this.logger.log(`Roles updated successfully for user: ${userId}`);
    return this.mapToResponseDto(updatedUser);
  }

  async addRoleToUser(userId: string, role: string): Promise<UserResponseDto> {
    this.logger.log(`Adding role '${role}' to user: ${userId}`);

    this.validateRole(role);

    const user = await this.findById(userId);
    if (!user) {
      this.logger.warn(`User not found for ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    if (!user.roles.includes(role)) {
      user.roles.push(role);
      const updatedUser = await this.userRepository.save(user);
      this.logger.log(`Role '${role}' added successfully to user: ${userId}`);
      return this.mapToResponseDto(updatedUser);
    } else {
      this.logger.warn(`Role '${role}' already exists for user: ${userId}`);
      return this.mapToResponseDto(user);
    }
  }

  async removeRoleFromUser(userId: string, role: string): Promise<UserResponseDto> {
    this.logger.log(`Removing role '${role}' from user: ${userId}`);

    this.validateRole(role);

    const user = await this.findById(userId);
    if (!user) {
      this.logger.warn(`User not found for ID: ${userId}`);
      throw new NotFoundException('User not found');
    }

    const roleIndex = user.roles.indexOf(role);
    if (roleIndex > -1) {
      user.roles.splice(roleIndex, 1);
      const updatedUser = await this.userRepository.save(user);
      this.logger.log(`Role '${role}' removed successfully from user: ${userId}`);
      return this.mapToResponseDto(updatedUser);
    } else {
      this.logger.warn(`Role '${role}' not found for user: ${userId}`);
      return this.mapToResponseDto(user);
    }
  }

  async userHasRole(userId: string, role: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) {
      return false;
    }
    return user.roles.includes(role);
  }

  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: UserResponseDto[]; total: number; page: number; limit: number }> {
    this.logger.log(`Getting all users with pagination: page=${page}, limit=${limit}`);

    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    this.logger.log(`Retrieved ${users.length} users out of ${total} total`);

    return {
      users: users.map(user => this.mapToResponseDto(user)),
      total,
      page,
      limit
    };
  }

  async getAvailableRoles(): Promise<{
    roles: Array<{
      name: string;
      displayName: string;
      description: string;
      permissions: string[];
    }>;
    total: number;
  }> {
    this.logger.log('Getting available roles');

    const roles = [
      {
        name: 'user',
        displayName: 'User',
        description: 'Basic user with limited access',
        permissions: ['read:own_profile', 'update:own_profile']
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'System administrator with full access',
        permissions: ['read:all', 'write:all', 'delete:all', 'manage:users', 'manage:customers']
      },
      {
        name: 'manager',
        displayName: 'Manager',
        description: 'Department manager with moderate access',
        permissions: ['read:all', 'write:limited', 'manage:customers']
      },
      {
        name: 'operator',
        displayName: 'Operator',
        description: 'Customer service operator',
        permissions: ['read:customers', 'write:customers', 'read:orders']
      },
      {
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access to system data',
        permissions: ['read:all']
      }
    ];

    this.logger.log(`Available roles retrieved: ${roles.length} roles`);
    return {
      roles,
      total: roles.length
    };
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

    const authenticatedUsers = await this.userRepository
      .createQueryBuilder('user')
      .where('user.auth0Id IS NOT NULL')
      .getCount();

    this.logger.log(`Additional stats - Recently active: ${recentlyActiveUsers}, New users: ${newUsers}, Authenticated: ${authenticatedUsers}`);

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

  async findByAuth0Id(auth0Id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { auth0Id },
      relations: ['permissions', 'customer'],
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: ['permissions', 'customer'],
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['permissions', 'customer'],
    });
  }

  async findOrCreateByAuth0Id(auth0Id: string, userData: any): Promise<UserEntity> {
    let user = await this.findByAuth0Id(auth0Id);
    
    if (!user) {
      user = await this.createUserFromAuth0Data(auth0Id, userData);
    }

    return user;
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

    const validRoles = ['admin', 'manager', 'user', 'operator', 'viewer'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}. Valid roles are: ${validRoles.join(', ')}`);
    }
  }

  private async createUserFromAuth0Data(auth0Id: string, userData: any): Promise<UserEntity> {
    const user = this.userRepository.create({
      auth0Id,
      email: userData.email,
      firstName: userData.name?.split(' ')[0] || userData.given_name || '',
      lastName: userData.name?.split(' ').slice(1).join(' ') || userData.family_name || '',
      avatar: userData.picture,
      roles: ['user'], 
      status: 'active',
    });
    
    return this.userRepository.save(user);
  }

  private mapToResponseDto(user: UserEntity): UserResponseDto {
    return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
  }
} 