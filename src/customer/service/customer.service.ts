import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { UserEntity } from '../../user/entities/user.entity';
import { AddressEntity } from '../entities/address.entity';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { RequestUser } from '../../user/interface/request-user.interface';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
  ) {}

  async ensureCustomerForUser(user: UserEntity, dto?: CreateCustomerDto): Promise<CustomerEntity> {
    this.logger.debug(`Ensuring customer exists for user: ${user.id}`);
    let customer = await this.customerRepository.findOne({
      where: { user: { id: user.id } },
      relations: ['user'],
    });

    if (customer) {
      this.logger.debug(`Customer already exists for user: ${user.id}`);
      return customer;
    }

    this.logger.debug(`Creating new customer for user: ${user.id}`);
    
    const customerData = {
      user,
      email: user.email,
      firstName: dto?.firstName || user.firstName,
      lastName: dto?.lastName || user.lastName,
      phone: dto?.phone,
      dateOfBirth: dto?.dateOfBirth,
      gender: dto?.gender,
      status: 'active' as const,
      segment: undefined,
      emailVerified: false,
      phoneVerified: false,
      marketingConsent: dto?.marketingConsent || false,
      preferredLanguage: dto?.preferredLanguage || 'uk',
      preferredCurrency: dto?.preferredCurrency || 'UAH',
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      tags: dto?.tags || [],
    };

    customer = this.customerRepository.create(customerData);
    const savedCustomer = await this.customerRepository.save(customer);
    
    this.logger.debug(`Customer created successfully: ${savedCustomer.id}`);

    if (!user.roles.includes('customer')) {
      this.logger.debug(`Adding 'customer' role to user: ${user.id}`);
      user.roles = [...user.roles, 'customer'];
      await this.userRepository.save(user);
      this.logger.debug(`Role 'customer' added to user: ${user.id}`);
    }

    return savedCustomer;
  }


  async getCurrentUserCustomer(user: RequestUser): Promise<CustomerEntity> {
    const auth0Id = user?.sub;
    
    if (!auth0Id) {
      this.logger.warn('Auth0 ID not found in request user object');
      throw new BadRequestException('Auth0 ID not found in request');
    }

    this.logger.debug(`Getting customer profile for Auth0 ID: ${auth0Id}`);
    
    const customer = await this.findByAuth0Id(auth0Id);
    if (!customer) {
      this.logger.warn(`Customer profile not found for Auth0 ID: ${auth0Id}`);
      throw new NotFoundException('Customer profile not found');
    }

    this.logger.debug(`Customer profile retrieved successfully for user: ${customer.id}`);
    return customer;
  }


  async updateCurrentUserCustomer(user: RequestUser, updateData: UpdateCustomerProfileDto): Promise<CustomerEntity> {
    const auth0Id = user?.sub;
    
    if (!auth0Id) {
      this.logger.warn('Auth0 ID not found in request user object');
      throw new BadRequestException('Auth0 ID not found in request');
    }

    this.logger.debug(`Updating customer profile for Auth0 ID: ${auth0Id}`);
    this.logger.debug(`Update data: ${JSON.stringify(updateData)}`);
    
    const customer = await this.findByAuth0Id(auth0Id);
    if (!customer) {
      this.logger.warn(`Customer profile not found for Auth0 ID: ${auth0Id}`);
      throw new NotFoundException('Customer profile not found');
    }

    this.validateUpdateData(updateData);

    const { addresses, ...customerUpdateData } = updateData;
    Object.assign(customer, customerUpdateData);

    if (addresses) {

      const newAddresses = addresses.map(addressData => {
        const address = new AddressEntity();
        Object.assign(address, addressData);
        address.customer = customer;
        return address;
      });

      customer.addresses = await this.addressRepository.save(newAddresses);
    }

    const updatedCustomer = await this.customerRepository.save(customer);

    this.logger.debug(`Customer profile updated successfully for user: ${customer.id}`);
    return updatedCustomer;
  }

  async getCustomerStatistics(user: RequestUser): Promise<{
    totalCustomers: number;
    vipCustomers: number;
    newCustomers: number;
    averageCheck: number;
    activeCustomers: number;
    inactiveCustomers: number;
    segments: {
      vip: number;
      regular: number;
      new: number;
      inactive: number;
    };
    lastUpdated: Date;
  }> {
    this.logger.log('Getting customer statistics');

    const totalCustomers = await this.customerRepository.count();

    const vipCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'vip' })
      .getCount();

    const newCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'new' })
      .getCount();

    const activeCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.status = :status', { status: 'active' })
      .getCount();

    const inactiveCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.status = :status', { status: 'inactive' })
      .getCount();

    let averageCheck = 0;
    
    if (totalCustomers > 0) {
      const customersWithOrders = await this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.totalOrders > 0')
        .getCount();
      
      if (customersWithOrders > 0) {
        const totalAverageValue = await this.customerRepository
          .createQueryBuilder('customer')
          .select('SUM(customer.averageOrderValue)', 'total')
          .where('customer.totalOrders > 0')
          .getRawOne();
        
        if (totalAverageValue && totalAverageValue.total) {
          averageCheck = parseFloat(totalAverageValue.total) / customersWithOrders;
        }
      }
    }

    const vipSegment = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'vip' })
      .getCount();

    const regularSegment = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'regular' })
      .getCount();

    const newSegment = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'new' })
      .getCount();

    const inactiveSegment = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'inactive' })
      .getCount();

    const statistics = {
      totalCustomers,
      vipCustomers,
      newCustomers,
      averageCheck: Math.round(averageCheck * 100) / 100,
      activeCustomers,
      inactiveCustomers,
      segments: {
        vip: vipSegment,
        regular: regularSegment,
        new: newSegment,
        inactive: inactiveSegment
      },
      lastUpdated: new Date()
    };

    this.logger.log(`Customer statistics retrieved: ${JSON.stringify(statistics)}`);
    return statistics;
  }

  async getAllCustomers(
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    status?: string, 
    segment?: string
  ): Promise<{ customers: CustomerEntity[]; total: number; page: number; limit: number; filters: any; pagination: any }> {
    this.logger.log(`Getting customers with filters: search=${search}, status=${status}, segment=${segment}`);
    
    const queryBuilder = this.customerRepository.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.user', 'user')
      .leftJoinAndSelect('customer.addresses', 'addresses');

    if (search) {
      queryBuilder.andWhere(
        '(customer.email ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (status) {
      queryBuilder.andWhere('customer.status = :status', { status });
    }

    if (segment) {
      queryBuilder.andWhere('customer.segment = :segment', { segment });
    }
    const skip = (page - 1) * limit;
    const [customers, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('customer.createdAt', 'DESC')
      .getManyAndCount();

    this.logger.log(`Retrieved ${customers.length} customers out of ${total} total`);

    return {
      customers: customers.map(customer => customer),
      total,
      page,
      limit,
      filters: {
        search,
        status,
        segment
      },
      pagination: {
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    };
  }

  async createCustomer(customerData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    segment?: 'vip' | 'regular' | 'new' | 'inactive';
    totalOrders?: number;
    totalSpent?: number;
    averageOrderValue?: number;
  }): Promise<CustomerEntity> {
    this.logger.log(`Creating new customer: ${customerData.email}`);

    const customer = this.customerRepository.create({
      email: customerData.email,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      phone: customerData.phone,
      segment: customerData.segment || 'regular',
      totalOrders: customerData.totalOrders || 0,
      totalSpent: customerData.totalSpent || 0,
      averageOrderValue: customerData.averageOrderValue || 0,
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
      marketingConsent: false,
      preferredLanguage: 'uk',
      preferredCurrency: 'UAH',
      tags: []
    });

    const savedCustomer = await this.customerRepository.save(customer);
    this.logger.log(`Customer created successfully: ${savedCustomer.id}`);

    return savedCustomer;
  }

  async getAllCustomersStatistics(): Promise<{
    totalCustomers: number;
    vipCustomers: number;
    newCustomers: number;
    averageCheck: number;
    activeCustomers: number;
    inactiveCustomers: number;
    segments: {
      vip: number;
      regular: number;
      new: number;
      inactive: number;
    };
    lastUpdated: Date;
  }> {
    this.logger.log('Getting all customers statistics');

    const totalCustomers = await this.customerRepository.count();

    const vipCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'vip' })
      .getCount();

    const newCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'new' })
      .getCount();

    const activeCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.status = :status', { status: 'active' })
      .getCount();

    const inactiveCustomers = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.status = :status', { status: 'inactive' })
      .getCount();

    let averageCheck = 0;
    
    if (totalCustomers > 0) {
      const customersWithOrders = await this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.totalOrders > 0')
        .getCount();
      
      if (customersWithOrders > 0) {
        const totalAverageValue = await this.customerRepository
          .createQueryBuilder('customer')
          .select('SUM(customer.averageOrderValue)', 'total')
          .where('customer.totalOrders > 0')
          .getRawOne();
        
        if (totalAverageValue && totalAverageValue.total) {
          averageCheck = parseFloat(totalAverageValue.total) / customersWithOrders;
        }
      }
    }

    const vipSegment = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'vip' })
      .getCount();

    const regularSegment = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'regular' })
      .getCount();

    const newSegment = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'new' })
      .getCount();

    const inactiveSegment = await this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.segment = :segment', { segment: 'inactive' })
      .getCount();

    const statistics = {
      totalCustomers,
      vipCustomers,
      newCustomers,
      averageCheck: Math.round(averageCheck * 100) / 100,
      activeCustomers,
      inactiveCustomers,
      segments: {
        vip: vipSegment,
        regular: regularSegment,
        new: newSegment,
        inactive: inactiveSegment
      },
      lastUpdated: new Date()
    };

    this.logger.log(`All customers statistics retrieved: ${JSON.stringify(statistics)}`);
    return statistics;
  }


  async findByAuth0Id(auth0Id: string): Promise<CustomerEntity | null> {
    return this.customerRepository.findOne({
      where: { user: { auth0Id } },
      relations: ['user', 'addresses'],
    });
  }


  private validateUpdateData(updateData: UpdateCustomerProfileDto): void {
    if (updateData.phone && !this.isValidPhoneNumber(updateData.phone)) {
      throw new BadRequestException('Invalid phone number format');
    }

    if (updateData.dateOfBirth && !this.isValidDate(updateData.dateOfBirth)) {
      throw new BadRequestException('Invalid date of birth format');
    }

    if (updateData.preferredLanguage && !['uk', 'en', 'ru'].includes(updateData.preferredLanguage)) {
      throw new BadRequestException('Invalid preferred language');
    }

    if (updateData.preferredCurrency && !['UAH', 'USD', 'EUR'].includes(updateData.preferredCurrency)) {
      throw new BadRequestException('Invalid preferred currency');
    }
  }


  private isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }


  private isValidDate(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }


  private mapToResponseDto(customer: CustomerEntity): CustomerEntity {
    return plainToClass(CustomerEntity, customer, { excludeExtraneousValues: true });
  }
}
