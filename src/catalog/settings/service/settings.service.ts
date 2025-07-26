import {
  BadRequestException,
  Body,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Param,
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

import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { ProductSetting } from '../entity/product-setting.entity';
import { UpdateSetting } from '../interface/updateSetting.interface';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ProductSetting)
    private settingsRepository: Repository<ProductSetting>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    @Inject(REQUEST) private readonly request: Request
  ) {}
  private readonly logger = new Logger(SettingsService.name);

  private async findProductById(productId?: string): Promise<Product> {
    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
        relations: ['family', 'options', 'settings', 'category'],
      });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      return product;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindProductById error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find product');
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
    @Body() createSettingDto: CreateSettingDto
  ): Promise<ProductSetting> {
    try {
      // const product = await this.findProductById(createSettingDto.productId);

      const productSetting = this.settingsRepository.create({
        ...createSettingDto,
        // product: product ?? undefined,
      });

      return await this.settingsRepository.save(productSetting);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `CreateProductSetting error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to create product setting');
    }
  }

  async findAll(query: Pagination) {
    try {
      const processedQuery = this.processQuery(query, this.request.query);

      const qb = this.settingsRepository
        .createQueryBuilder('productSettings')
        .leftJoinAndSelect('productSettings.product', 'product');

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
        'productSettings',
        paginationQuery,
        processedQuery.filters
      );

      return {
        settings: result.data,
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
        `FindAllProductSettings error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find product settings');
    }
  }

  async findOne(@Param('id') id: string): Promise<ProductSetting> {
    try {
      const setting = await this.settingsRepository.findOne({
        where: {
          id,
        },
        relations: ['product'],
      });

      if (!setting) {
        throw new NotFoundException('Setting not found');
      }

      return setting;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindOneProductSetting error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find product setting');
    }
  }

  async update(
    @Param('id') id: string,
    @Body() updateSettingDto: UpdateSettingDto
  ): Promise<ProductSetting> {
    try {
      const setting = await this.settingsRepository.findOne({
        where: { id },
      });

      if (!setting) throw new NotFoundException('Product setting not found');

      const product = await this.findProductById(updateSettingDto.productId);

      const updateDto: UpdateSetting = {
        key: updateSettingDto.key ?? setting.key,
        value: updateSettingDto.value ?? setting.value,
      };

      const productSetting = this.settingsRepository.create({
        ...updateDto,
        product: product ?? undefined,
      });

      const updated = this.settingsRepository.merge(setting, {
        ...productSetting,
      });

      return await this.settingsRepository.save(updated);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `UpdateProductSetting error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to update product setting');
    }
  }

  async remove(@Param('id') id: string): Promise<{
    message: string;
  }> {
    try {
      const setting = await this.settingsRepository.findOne({
        where: { id },
      });

      if (!setting) throw new NotFoundException('Product setting not found');

      await this.settingsRepository.remove(setting);

      return { message: 'Product setting deleted successfully' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `RemoveProductSetting error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to delete product setting');
    }
  }
}
