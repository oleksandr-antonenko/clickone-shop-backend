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

import { CreateAttributeDto } from '../dto/create-attribute.dto';
import { UpdateAttributeDto } from '../dto/update-attribute.dto';
import { AttributeOption } from '../entity/attribute-options.entity';
import { Attribute } from '../entity/attribute.entity';

@Injectable()
export class AttributesService {
  constructor(
    @InjectRepository(Attribute)
    private attributesRepository: Repository<Attribute>,
    @InjectRepository(AttributeOption)
    private attributeOptionsRepository: Repository<AttributeOption>,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    @Inject(REQUEST) private readonly request: Request
  ) {}

  private readonly logger = new Logger(AttributesService.name);

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
    createAttributesValueDto: CreateAttributeDto
  ): Promise<Attribute> {
    try {
      const { options, ...rest } = createAttributesValueDto;

      const attributesValue = this.attributesRepository.create({
        ...rest,
        options: options?.map((option) =>
          this.attributeOptionsRepository.create({ value: option })
        ),
      });

      return await this.attributesRepository.save(attributesValue);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`CreateAttribute error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to create attribute');
    }
  }

  async findAll(query: Pagination) {
    try {
      const processedQuery = this.processQuery(query, this.request.query);

      const qb = this.attributesRepository
        .createQueryBuilder('attributes')
        .leftJoinAndSelect('attributes.options', 'options');

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
        'attributes',
        paginationQuery,
        processedQuery.filters
      );

      return {
        attributes: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindAllAttributes error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find attributes');
    }
  }

  async findOne(id: number): Promise<Attribute> {
    try {
      const attributesValue = await this.attributesRepository.findOne({
        where: {
          id,
        },
        relations: ['options'],
      });

      if (!attributesValue) {
        throw new NotFoundException('Attribute not found');
      }

      return attributesValue;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindOneAttribute error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to find attribute');
    }
  }

  async update(
    id: number,
    updateAttributeDto: UpdateAttributeDto
  ): Promise<Attribute> {
    try {
      const { options, ...rest } = updateAttributeDto;

      const attribute = await this.attributesRepository.findOne({
        where: { id },
        relations: ['options'],
      });

      if (!attribute) {
        this.logger.warn('Attribute not found');
        throw new NotFoundException('Attribute not found');
      }

      this.attributesRepository.merge(attribute, rest);

      if (options) {
        await this.attributeOptionsRepository.delete({ attribute: { id } });

        attribute.options = options.map((value) =>
          this.attributeOptionsRepository.create({ value, attribute })
        );
      }

      return await this.attributesRepository.save(attribute);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`UpdateAttribute error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to update attribute');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const attributeValue = await this.attributesRepository.findOne({
        where: { id },
      });

      if (!attributeValue) throw new NotFoundException('Attribute not found');

      await this.attributesRepository.remove(attributeValue);

      return { message: 'Attribute deleted successfully' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`RemoveAttribute error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete attribute');
    }
  }
}
