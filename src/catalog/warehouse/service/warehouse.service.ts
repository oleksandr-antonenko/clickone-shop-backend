import {
  BadRequestException,
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
import { WarehouseOperation } from '../entities/warehouse-operation.entity';
import { Warehouse } from '../entities/warehouse.entity';
import { WarehouseChangeType } from '../interfaces/warehouse-operation.interface';

@Injectable()
export class WarehouseService {
  private readonly logger = new Logger(WarehouseService.name);

  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(WarehouseOperation)
    private readonly warehouseOperationRepository: Repository<WarehouseOperation>,
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

  async reserve(productId: string, quantity: number) {
    try {
      const warehouse = await this.warehouseRepository.findOne({
        where: { product: { id: productId } },
      });
      if (!warehouse) {
        throw new NotFoundException('Warehouse not found for the product');
      }
      if (warehouse.availableQuantity < quantity) {
        throw new BadRequestException('Insufficient stock available');
      }
      const updatedWarehouse = this.warehouseRepository.merge(warehouse, {
        reservedQuantity: warehouse.reservedQuantity + quantity,
        availableQuantity: warehouse.availableQuantity - quantity,
      });
      await this.warehouseRepository.save(updatedWarehouse);
      return updatedWarehouse;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`ReserveWarehouse error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to reserve warehouse');
    }
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
  ) {
    try {
      const {
        supplierAddition,
        costPrice,
        inventoryWriteOff,
        lowStockThreshold,
        type,
      } = createWarehouseOperationDto;
      const warehouse = await this.warehouseRepository.findOne({
        where: { id },
      });
      if (!warehouse) {
        throw new NotFoundException('Warehouse not found');
      }

      const warehouseOperation = this.warehouseOperationRepository.create({
        ...createWarehouseOperationDto,
        beforeQuantity: createWarehouseOperationDto.lowStockThreshold
          ? undefined
          : warehouse.quantity,
        ...(createWarehouseOperationDto.supplierAddition && {
          afterQuantity:
            warehouse.quantity + createWarehouseOperationDto.supplierAddition,
        }),
        ...(createWarehouseOperationDto.inventoryWriteOff && {
          afterQuantity:
            warehouse.quantity - createWarehouseOperationDto.inventoryWriteOff,
        }),
        ...(createWarehouseOperationDto.lowStockThreshold && {
          afterQuantity: undefined,
        }),
        warehouse,
      });

      await this.warehouseOperationRepository.save(warehouseOperation);

      const updateWarehouseDto = {} as UpdateWarehouseDto;

      if (supplierAddition && type === WarehouseChangeType.ADDITION) {
        updateWarehouseDto.quantity = warehouse.quantity + supplierAddition;
        updateWarehouseDto.availableQuantity =
          warehouse.availableQuantity + supplierAddition;
        updateWarehouseDto.costPrice = costPrice;
      }
      if (inventoryWriteOff && type === WarehouseChangeType.WRITE_OFF) {
        updateWarehouseDto.quantity = warehouse.quantity - inventoryWriteOff;
        updateWarehouseDto.availableQuantity =
          warehouse.availableQuantity - inventoryWriteOff;
      }
      if (lowStockThreshold && type === WarehouseChangeType.LOW_STOCK_CHANGE) {
        updateWarehouseDto.lowStockThreshold = lowStockThreshold;
      }

      const updated = this.warehouseRepository.merge(
        warehouse,
        updateWarehouseDto
      );

      await this.warehouseRepository.save(updated);

      return { success: true };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `CreateWarehouseOperation error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to create warehouse operation');
    }
  }

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
      this.logger.error(`FindAllWarehouses error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find warehouses');
    }
  }

  async findAllOperations(id: string, query: Pagination) {
    try {
      const processedQuery = this.processQuery(query, this.request.query);

      const qb = this.warehouseOperationRepository
        .createQueryBuilder('warehouse_operation')
        .where('warehouse_operation.warehouse_id = :id', { id });

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
        'warehouse_operation',
        paginationQuery,
        processedQuery.filters
      );

      return {
        warehouseOperations: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindAllWarehouseOperations error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find warehouse operations');
    }
  }
}
