import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';

import { Parser } from '@json2csv/plainjs';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Product } from '~/catalog/product/entities/product.entity';
import {
  Pagination,
  ProcessedPagination,
} from '~/catalog/product/interface/pagination.interface';
import { WarehouseService } from '~/catalog/warehouse/service/warehouse.service';
import { FilterParserService } from '~/filter/service/filter-parser.service';
import { PaginationQuery } from '~/pagination/interface/pagination.interface';
import { PaginationService } from '~/pagination/service/pagination.service';

import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderDto } from '../dto/update-order.dto';
import { Address } from '../entities/address.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/orderItem.entity';
import { OrderStatus } from '../interface/create-order.interface';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    private readonly warehouseService: WarehouseService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  private readonly logger = new Logger(OrderService.name);

  private processQuery(
    query: Pagination,
    rawQuery?: Record<string, any>
  ): ProcessedPagination {
    const parsedFilters = this.filterParserService.parseFilters(
      query.filters,
      rawQuery
    );

    const sanitizedFilters = parsedFilters
      ? this.filterParserService.validateAndSanitizeFilters(parsedFilters)
      : undefined;

    return {
      ...query,
      filters: sanitizedFilters,
      sortOrder: query.sortOrder?.toUpperCase() as 'ASC' | 'DESC' | undefined,
    };
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      const { shippingAddress, billingAddress, items, ...orderData } =
        createOrderDto;

      const savedShippingAddress =
        await this.addressRepository.save(shippingAddress);
      const savedBillingAddress = billingAddress
        ? await this.addressRepository.save(billingAddress)
        : undefined;

      const order = this.orderRepository.create({
        ...orderData,
        shippingAddress: savedShippingAddress,
        billingAddress: savedBillingAddress,
      });

      const savedOrder = await this.orderRepository.save(order);

      const orderItems = [] as OrderItem[];
      for (const itemDto of items) {
        const product = await this.productRepository.findOneBy({
          id: itemDto.productId,
        });
        if (!product) throw new NotFoundException('Product not found');

        const orderItem = this.orderItemRepository.create({
          quantity: itemDto.quantity,
          price: itemDto.price,
          total: itemDto.total,
          attributes: itemDto.attributes,
          product,
          order: savedOrder,
        });

        orderItems.push(orderItem);
      }

      await this.orderItemRepository.save(orderItems);

      return this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items', 'shippingAddress', 'billingAddress'],
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(`CreateOrder error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to create order');
    }
  }

  async exportOrders() {
    try {
      const orders = await this.orderRepository.find({
        relations: ['items', 'shippingAddress', 'billingAddress'],
      });
      if (!orders || orders.length === 0) {
        throw new NotFoundException('No orders found');
      }
      const parser = new Parser();
      const csv = parser.parse(orders);

      return csv;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`ExportOrders error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to export orders');
    }
  }

  async findAll(query: Pagination) {
    try {
      const processedQuery = this.processQuery(query, this.request.query);

      const qb = this.orderRepository.createQueryBuilder('order');

      const paginationQuery: PaginationQuery = {
        page: processedQuery.page,
        limit: processedQuery.limit,
        sortBy: processedQuery.sortBy || 'id',
        sortOrder: processedQuery.sortOrder?.toUpperCase() as
          | 'ASC'
          | 'DESC'
          | undefined,
        filters: processedQuery.filters,
      };

      const result = await this.paginationService.paginate(
        qb,
        'order',
        paginationQuery,
        processedQuery.filters
      );

      return {
        orders: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindAllOrders error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find orders');
    }
  }

  async findOne(id: string) {
    try {
      const order = await this.orderRepository.findOne({
        where: {
          id,
        },
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      return order;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindOneOrder error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to find order');
    }
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      const existingOrder = await this.orderRepository.findOne({
        where: { id },
      });

      if (!existingOrder) {
        this.logger.warn('Order not found');
        throw new NotFoundException('Order not found');
      }

      if (updateOrderDto.status === OrderStatus.Pending) {
        throw new ForbiddenException('Cannot change status');
      }

      if (updateOrderDto.status === OrderStatus.Confirmed) {
        if (existingOrder.status !== OrderStatus.Pending) {
          throw new ForbiddenException('Cannot change status');
        }
        for (const item of existingOrder.items) {
          await this.warehouseService.setOrderStatus(
            item.product.id,
            item.quantity,
            updateOrderDto.status
          );
        }
      }

      if (
        updateOrderDto.status === OrderStatus.Processing &&
        existingOrder.status !== OrderStatus.Confirmed
      ) {
        throw new ForbiddenException('Cannot change status');
      }

      if (updateOrderDto.status === OrderStatus.Shipped) {
        if (existingOrder.status !== OrderStatus.Processing) {
          throw new ForbiddenException('Cannot change status');
        }
        for (const item of existingOrder.items) {
          await this.warehouseService.setOrderStatus(
            item.product.id,
            item.quantity,
            updateOrderDto.status
          );
        }
      }

      if (
        updateOrderDto.status === OrderStatus.Delivered &&
        existingOrder.status !== OrderStatus.Shipped
      ) {
        throw new ForbiddenException('Cannot change status');
      }

      if (
        updateOrderDto.status === OrderStatus.Cancelled &&
        existingOrder.status !== OrderStatus.Delivered
      ) {
        throw new ForbiddenException('Cannot change status');
      }

      if (updateOrderDto.status === OrderStatus.Returned) {
        if (existingOrder.status !== OrderStatus.Cancelled) {
          throw new ForbiddenException('Cannot change status');
        }
        for (const item of existingOrder.items) {
          await this.warehouseService.setOrderStatus(
            item.product.id,
            item.quantity,
            updateOrderDto.status
          );
        }
      }

      const updated = this.orderRepository.merge(existingOrder, updateOrderDto);

      return await this.orderRepository.save(updated);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`UpdateOrder error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to update order');
    }
  }
}
