import { Injectable, NotFoundException, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomerEntity } from '../entities/customer.entity';
import { AddressEntity } from '../entities/address.entity';
import { CustomerResponseDto } from '../dto/customer-response.dto';
import { UpdateCustomerProfileDto } from '../dto/update-customer-profile.dto';
import { RequestUser } from '../../user/interface/request-user.interface';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

    constructor(
        @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(AddressEntity)
    private readonly addressRepository: Repository<AddressEntity>,
  ) {}


  async getCurrentUserCustomer(user: RequestUser): Promise<CustomerResponseDto> {
    const auth0Id = user?.sub;
    
    if (!auth0Id) {
      this.logger.warn('Auth0 ID not found in request user object');
      throw new UnauthorizedException('Auth0 ID not found in request');
    }

    this.logger.debug(`Getting customer profile for Auth0 ID: ${auth0Id}`);
    
    const customer = await this.findByAuth0Id(auth0Id);
    if (!customer) {
      this.logger.warn(`Customer profile not found for Auth0 ID: ${auth0Id}`);
      throw new NotFoundException('Customer profile not found');
    }

    this.logger.debug(`Customer profile retrieved successfully for user: ${customer.id}`);
    return this.mapToResponseDto(customer);
  }


  async updateCurrentUserCustomer(user: RequestUser, updateData: UpdateCustomerProfileDto): Promise<CustomerResponseDto> {
    const auth0Id = user?.sub;
    
    if (!auth0Id) {
      this.logger.warn('Auth0 ID not found in request user object');
      throw new UnauthorizedException('Auth0 ID not found in request');
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
      if (customer.addresses && customer.addresses.length > 0) {
        await this.addressRepository.remove(customer.addresses);
      }

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
    return this.mapToResponseDto(updatedCustomer);
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

  async createCustomer(customerData: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    segment?: 'vip' | 'regular' | 'new' | 'inactive';
    totalOrders?: number;
    totalSpent?: number;
    averageOrderValue?: number;
  }): Promise<CustomerResponseDto> {
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

    return this.mapToResponseDto(savedCustomer);
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


  private mapToResponseDto(customer: CustomerEntity): CustomerResponseDto {
    return plainToClass(CustomerResponseDto, customer, { excludeExtraneousValues: true });
  }
}
