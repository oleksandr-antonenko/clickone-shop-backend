import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
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

  async findAll(query: Pagination) {
    try {
      const processedQuery = this.processQuery(query, this.request.query);

      const qb = this.warehouseRepository
        .createQueryBuilder('warehouse')
        .leftJoinAndSelect('warehouse.product', 'product')
        .leftJoinAndSelect('product.selectedOptions', 'selectedOptions')
        .leftJoinAndSelect('selectedOptions.attribute', 'attribute');

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

  findOne(id: string) {
    return `This action returns a #${id} warehouse`;
  }

  update(id: string, updateWarehouseDto: UpdateWarehouseDto) {
    return `This action updates a #${id} warehouse`;
  }

  remove(id: string) {
    return `This action removes a #${id} warehouse`;
  }
}
