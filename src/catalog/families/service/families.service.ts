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
import {
  Pagination,
  ProcessedPagination,
} from '~/catalog/product/interface/pagination.interface';
import { FilterParserService } from '~/filter/service/filter-parser.service';
import { PaginationQuery } from '~/pagination/interface/pagination.interface';
import { PaginationService } from '~/pagination/service/pagination.service';

import { CreateFamilyDto } from '../dto/create-family.dto';
import { UpdateFamilyDto } from '../dto/update-family.dto';
import { ProductFamily } from '../entity/product-family.entity';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(ProductFamily)
    private productFamilyRepository: Repository<ProductFamily>,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  private readonly logger = new Logger(FamiliesService.name);

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

  async create(
    createProductFamilyDto: CreateFamilyDto
  ): Promise<ProductFamily> {
    try {
      const productFamily = this.productFamilyRepository.create({
        ...createProductFamilyDto,
      });

      return await this.productFamilyRepository.save(productFamily);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`CreateProductFamily error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to create product family');
    }
  }

  async findAll(query: Pagination) {
    try {
      const processedQuery = this.processQuery(query, this.request.query);

      const qb = this.productFamilyRepository
        .createQueryBuilder('productFamilies')
        .leftJoinAndSelect('productFamilies.products', 'products');

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
        'productFamilies',
        paginationQuery,
        processedQuery.filters
      );

      return {
        families: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(
        `FindAllProductFamilies error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find product families');
    }
  }

  async findOne(id: string): Promise<ProductFamily> {
    try {
      const family = await this.productFamilyRepository.findOne({
        where: {
          id,
        },
        relations: ['products'],
      });

      if (!family) {
        throw new NotFoundException(`Product family not found`);
      }

      return family;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(
        `FindOneProductFamily error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find product family');
    }
  }

  async update(
    id: string,
    updateFamilyDto: UpdateFamilyDto
  ): Promise<ProductFamily> {
    try {
      const existingFamily = await this.productFamilyRepository.findOne({
        where: { id },
      });

      if (!existingFamily)
        throw new NotFoundException(`Product family not found`);

      const updatedFamily = { ...existingFamily, ...updateFamilyDto };

      return await this.productFamilyRepository.save(updatedFamily);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`UpdateProductFamily error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to update product family');
    }
  }

  async remove(id: string): Promise<{
    message: string;
  }> {
    try {
      const family = await this.productFamilyRepository.findOne({
        where: { id },
        relations: ['products'],
      });

      if (!family) {
        throw new NotFoundException(`Product family not found`);
      }

      if (family.products && family.products.length > 0) {
        throw new BadRequestException(
          'Cannot delete product family with existing products'
        );
      }

      await this.productFamilyRepository.remove(family);

      return {
        message: `Product family deleted successfully`,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`RemoveProductFamily error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to remove product family');
    }
  }
}
