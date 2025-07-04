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
import { Category } from '~/catalog/category/entities/category.entity';
import {
  Pagination,
  ProcessedPagination,
} from '~/catalog/product/interface/pagination.interface';
import { FilterParserService } from '~/filter/service/filter-parser.service';
import { FilterService } from '~/filter/service/filter.service';
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
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private readonly filterService: FilterService,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  private readonly logger = new Logger(FamiliesService.name);

  private async findCategoryById(categoryId: number): Promise<Category> {
    try {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
        relations: ['families', 'products'],
      });
      if (!category) {
        this.logger.warn('Category not found');
        throw new NotFoundException(`Category not found`);
      }

      return category;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`FindCategoryById error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find category');
    }
  }

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
      if (!createProductFamilyDto.categoryId) {
        throw new BadRequestException('Category ID is required');
      }
      const category = await this.findCategoryById(
        createProductFamilyDto.categoryId
      );

      const productFamily = this.productFamilyRepository.create({
        ...createProductFamilyDto,
        category,
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
        .createQueryBuilder('productFamily')
        .leftJoinAndSelect('productFamily.category', 'category')
        .leftJoinAndSelect('productFamily.products', 'products');

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

      this.filterService.applyFilters(
        qb,
        'productFamily',
        processedQuery.filters ?? {}
      );

      const result = await this.paginationService.paginate(
        qb,
        'productFamily',
        paginationQuery
      );

      return {
        productFamily: result.data,
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

  async findOne(id: number): Promise<ProductFamily> {
    try {
      const family = await this.productFamilyRepository.findOne({
        where: {
          id,
        },
        relations: ['category', 'products'],
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
    id: number,
    updateFamilyDto: UpdateFamilyDto
  ): Promise<ProductFamily> {
    try {
      const existingFamily = await this.productFamilyRepository.findOne({
        where: { id },
      });

      if (!existingFamily)
        throw new NotFoundException(`Product family not found`);

      let category: Category | undefined;

      if (updateFamilyDto.categoryId) {
        category = await this.findCategoryById(updateFamilyDto.categoryId);
      } else {
        this.logger.warn('Category ID not provided');
      }

      const updated = this.productFamilyRepository.merge(existingFamily, {
        ...updateFamilyDto,
        ...(category && { category }),
      });

      return await this.productFamilyRepository.save(updated);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`UpdateProductFamily error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to update product family');
    }
  }

  async remove(id: number): Promise<{
    message: string;
  }> {
    try {
      const family = await this.productFamilyRepository.findOne({
        where: { id },
      });

      if (!family) throw new NotFoundException('Product family not found');

      await this.productFamilyRepository.remove(family);

      return { message: 'Product family deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`RemoveProductFamily error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to delete product family');
    }
  }
}
