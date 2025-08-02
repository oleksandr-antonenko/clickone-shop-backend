import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { Repository } from 'typeorm';
import { Product } from '~/catalog/product/entities/product.entity';
import {
  Pagination,
  ProcessedPagination,
} from '~/catalog/product/interface/pagination.interface';
import { FilterParserService } from '~/filter/service/filter-parser.service';
import { PaginationQuery } from '~/pagination/interface/pagination.interface';
import { PaginationService } from '~/pagination/service/pagination.service';

import { CreateWarehouseOperationDto } from '../dto/create-warehouse-operation.dto';
import { UpdateWarehouseDto } from '../dto/update-warehouse.dto';
import { Warehouse } from '../entities/warehouse.entity';

@Injectable()
export class WarehouseService {
  private readonly logger = new Logger(WarehouseService.name);

  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

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

  async create(product: Product) {
    try {
      const dto = {
        quantity: 0,
        reservedQuantity: 0,
        availableQuantity: 0,
        lowStockThreshold: 0,
      };
      const newItem = this.warehouseRepository.create({
        ...dto,
        product,
      });

      return await this.warehouseRepository.save(newItem);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`CreateWarehouse error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to create warehouse');
    }
  }

  async createOperation(
    id: string,
    createWarehouseOperationDto: CreateWarehouseOperationDto
  ) {}

  async findAll(query: Pagination) {
    try {
      const processedQuery = this.processQuery(query, this.request.query);

      const qb = this.warehouseRepository
        .createQueryBuilder('warehouse')
        .leftJoinAndSelect('warehouse.product', 'product')
        .leftJoinAndSelect('product.attributes', 'attributes')
        .leftJoinAndSelect('product.selectedOptions', 'selectedOptions');

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
        'warehouse',
        paginationQuery,
        processedQuery.filters
      );

      return {
        warehouses: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindAllBrands error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find brands');
    }
  }

  async findOne(id: string) {
    try {
      const warehouseItem = await this.warehouseRepository.findOne({
        where: {
          id,
        },
        relations: [
          'product',
          'product.selectedOptions',
          'product.selectedOptions.attribute',
        ],
      });

      if (!warehouseItem) {
        throw new NotFoundException('Warehouse item not found');
      }

      return warehouseItem;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`FindWarehouseItem error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find warehouse item');
    }
  }

  update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    return `This action updates a #${id} warehouse`;
  }
}
