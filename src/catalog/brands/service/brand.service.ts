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

import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  private readonly logger = new Logger(BrandService.name);

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

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    try {
      const newBrand = this.brandRepository.create(createBrandDto);

      return await this.brandRepository.save(newBrand);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`CreateBrand error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to create brand');
    }
  }

  async findAll(query: Pagination) {
    try {
      const processedQuery = this.processQuery(query, this.request.query);

      const qb = this.brandRepository
        .createQueryBuilder('brand')
        .leftJoinAndSelect('brand.products', 'products');

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
        'brand',
        paginationQuery,
        processedQuery.filters
      );

      return {
        brands: result.data,
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

  async findOne(id: number): Promise<Brand> {
    try {
      const brand = await this.brandRepository.findOne({
        where: {
          id,
        },
        relations: ['products'],
      });

      if (!brand) {
        throw new NotFoundException('Brand not found');
      }

      return brand;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`FindOneBrand error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find brand');
    }
  }

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    try {
      const existingBrand = await this.brandRepository.findOne({
        where: { id },
        relations: ['products'],
      });

      if (!existingBrand) throw new NotFoundException('Brand not found');

      const updated = this.brandRepository.merge(existingBrand, updateBrandDto);

      return await this.brandRepository.save(updated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`UpdateBrand error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to update brand');
    }
  }

  async remove(id: number): Promise<{
    message: string;
  }> {
    try {
      const brand = await this.brandRepository.findOne({
        where: { id },
        relations: ['products'],
      });

      if (!brand) throw new NotFoundException('Brand not found');

      await this.brandRepository.remove(brand);

      return { message: 'Brand deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`RemoveBrand error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to delete brand');
    }
  }
}
