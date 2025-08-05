import { Injectable, Logger, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { CustomerEntity } from '../../customer/entities/customer.entity';
import { Order } from '../../order/entities/order.entity';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { Auth0WebhookDto } from '../dto/auth0-webhook.dto';
import { CompleteOrderDto } from '../dto/complete-order.dto';
import { OrderStatus } from '../../order/interface/create-order.interface';
import { plainToClass } from 'class-transformer';

@Injectable()
export class InternalService {
  private readonly logger = new Logger(InternalService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CustomerEntity)
    private readonly customerRepository: Repository<CustomerEntity>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}


  async handleAuth0UserCreated(webhookData: Auth0WebhookDto): Promise<UserResponseDto> {
    this.logger.log(`Auth0 webhook received for user: ${webhookData.sub}`);
    this.logger.debug(`Webhook data: ${JSON.stringify(webhookData, null, 2)}`);
    
    try {
      this.validateWebhookData(webhookData);
      
      const existingUser = await this.checkForExistingUser(webhookData);
      
      if (existingUser) {
        this.logger.log(`🔄 Updating last login for existing user: ${existingUser.id}`);
        existingUser.lastLoginAt = new Date();
        const updatedUser = await this.userRepository.save(existingUser);
        this.logger.log(`✅ Last login updated for user: ${updatedUser.id}`);
        return this.mapToResponseDto(updatedUser);
      }
      
      const user = await this.createUserAndCustomerFromWebhook(webhookData);
      
      this.logger.log(`✅ User and Customer created successfully: User ID ${user.id}, Customer ID ${user.customer?.id}`);
      return this.mapToResponseDto(user);
      
    } catch (error) {
      this.logger.error(`❌ Failed to create user from Auth0 webhook: ${error.message}`, error.stack);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }
  }


  async completeOrder(completeOrderData: CompleteOrderDto): Promise<Order> {
    this.logger.log(`Completing order: ${completeOrderData.orderId}`);
    this.logger.debug(`Completion data: ${JSON.stringify(completeOrderData, null, 2)}`);

    try {
      const order = await this.findOrderById(completeOrderData.orderId);
      if (!order) {
        this.logger.warn(`Order not found: ${completeOrderData.orderId}`);
        throw new NotFoundException('Order not found');
      }

      this.validateOrderCanBeCompleted(order);

      order.status = OrderStatus.Delivered;
      order.deliveredAt = completeOrderData.deliveredAt || new Date().toISOString();
      
      if (completeOrderData.trackingNumber) {
        order.trackingNumber = completeOrderData.trackingNumber;
      }
      
      if (completeOrderData.adminNotes) {
        order.adminNotes = completeOrderData.adminNotes;
      }

      const updatedOrder = await this.orderRepository.save(order);
      
      this.logger.log(`Order completed successfully: ${order.id}`);
      return updatedOrder;

    } catch (error) {
      this.logger.error(`❌ Failed to complete order: ${error.message}`, error.stack);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException(`Failed to complete order: ${error.message}`);
    }
  }


  async findByAuth0Id(auth0Id: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { auth0Id },
      relations: ['permissions', 'customer'],
    });
  }


  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: ['permissions', 'customer'],
    });
  }


  async findOrderById(orderId: string): Promise<Order | null> {
    return this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'shippingAddress', 'billingAddress'],
    });
  }


  private validateWebhookData(webhookData: Auth0WebhookDto): void {
    this.logger.debug(`Validating webhook data for User creation: ${webhookData.sub}`);
    
    if (!webhookData.sub) {
      this.logger.error('Auth0 ID (sub) is missing');
      throw new BadRequestException('Auth0 ID (sub) is required');
    }
    if (!webhookData.email) {
      this.logger.error('❌ Email is missing');
      throw new BadRequestException('Email is required');
    }
    
    this.logger.debug('Webhook data validation passed');
  }


  private async checkForExistingUser(webhookData: Auth0WebhookDto): Promise<UserEntity | null> {
    this.logger.debug(`Checking for existing User with Auth0 ID: ${webhookData.sub}`);
    
    const existingByAuth0Id = await this.userRepository.findOne({
      where: { auth0Id: webhookData.sub },
      relations: ['customer'],
    });
    if (existingByAuth0Id) {
      this.logger.debug(`Found existing User with Auth0 ID: ${webhookData.sub}`);
      return existingByAuth0Id;
    }

    this.logger.debug(`🔍 Checking for existing User with email: ${webhookData.email}`);
    const existingByEmail = await this.userRepository.findOne({
      where: { email: webhookData.email },
      relations: ['customer'],
    });
    if (existingByEmail) {
      this.logger.debug(`Found existing User with email: ${webhookData.email}`);
      return existingByEmail;
    }
    
    this.logger.debug('No existing User found');
    return null;
  }


  private async createUserAndCustomerFromWebhook(webhookData: Auth0WebhookDto): Promise<UserEntity> {
    this.logger.debug(`🏗️ Creating new User and Customer with Auth0 ID: ${webhookData.sub}`);
    
    const user = this.userRepository.create({
      auth0Id: webhookData.sub,
      email: webhookData.email,
      firstName: this.extractFirstName(webhookData),
      lastName: this.extractLastName(webhookData),
      avatar: webhookData.picture,
      roles: ['user'],
      status: 'active',
      lastLoginAt: new Date(),
    });

    const savedUser = await this.userRepository.save(user);
    this.logger.debug(`💾 User saved to database: ${savedUser.id}`);

    const customer = this.customerRepository.create({
      user: savedUser,
      email: webhookData.email,
      firstName: this.extractFirstName(webhookData),
      lastName: this.extractLastName(webhookData),
      segment: 'new',
      status: 'active',
      emailVerified: false,
      phoneVerified: false,
      marketingConsent: false,
      preferredLanguage: 'uk',
      preferredCurrency: 'UAH',
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      tags: []
    });

    const savedCustomer = await this.customerRepository.save(customer);
    this.logger.debug(`💾 Customer (shop customer) saved to database: ${savedCustomer.id}`);

    savedUser.customer = savedCustomer;
    const updatedUser = await this.userRepository.save(savedUser);
    this.logger.debug(`✅ User customer relationship updated: ${updatedUser.id}`);

    return updatedUser;
  }


  private validateOrderCanBeCompleted(order: Order): void {
    this.logger.debug(`Validating order can be completed: ${order.id}`);
    
    if (order.status === OrderStatus.Delivered) {
      this.logger.warn(`Order already delivered: ${order.id}`);
      throw new BadRequestException('Order is already delivered');
    }

    if (order.status === OrderStatus.Cancelled) {
      this.logger.warn(`Cannot complete cancelled order: ${order.id}`);
      throw new BadRequestException('Cannot complete cancelled order');
    }

    if (order.status === OrderStatus.Returned) {
      this.logger.warn(`Cannot complete returned order: ${order.id}`);
      throw new BadRequestException('Cannot complete returned order');
    }

    const validStatuses = [OrderStatus.Pending, OrderStatus.Confirmed, OrderStatus.Processing, OrderStatus.Shipped];
    if (!validStatuses.includes(order.status)) {
      this.logger.warn(`Order status not valid for completion: ${order.status}`);
      throw new BadRequestException(`Order status '${order.status}' is not valid for completion`);
    }
    
    this.logger.debug('Order validation passed');
  }


  private extractFirstName(webhookData: Auth0WebhookDto): string {
    return webhookData.given_name || 
           webhookData.name?.split(' ')[0] || 
           '';
  }


  private extractLastName(webhookData: Auth0WebhookDto): string {
    return webhookData.family_name || 
           webhookData.name?.split(' ').slice(1).join(' ') || 
           '';
  }


  private mapToResponseDto(user: UserEntity): UserResponseDto {
    return plainToClass(UserResponseDto, user, { excludeExtraneousValues: true });
  }
} 