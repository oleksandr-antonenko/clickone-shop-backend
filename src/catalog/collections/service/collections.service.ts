import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';
import { FilterParserService } from '~/filter/service/filter-parser.service';
import { PaginationQuery } from '~/pagination/interface/pagination.interface';
import { PaginationService } from '~/pagination/service/pagination.service';

import { CollectionProductsPaginationDto } from '../dto/collection-products-pagination.dto';
import { CollectionsDto } from '../dto/collections.dto';
import { PaginationQueryCollectionDto } from '../dto/pagination-query-collection.dto';
import { CollectionProduct } from '../entity/collection-product.entity';
import { Collection } from '../entity/collections.entity';
import { CollectionStatus } from '../interface/collections.interface';

@Injectable()
export class CollectionsService {
  private readonly logger = new Logger(CollectionsService.name);

  constructor(
    @InjectRepository(Collection)
    private collectionsRepository: Repository<Collection>,
    @InjectRepository(CollectionProduct)
    private collectionProductRepository: Repository<CollectionProduct>,
    private filterParserService: FilterParserService,
    private paginationService: PaginationService
  ) {}

  async create(createCollectionDto: CollectionsDto): Promise<Collection> {
    try {
      const existingCollection = await this.collectionsRepository.findOne({
        where: { slug: createCollectionDto.slug },
      });

      if (existingCollection) {
        throw new BadRequestException(
          `Collection with slug "${createCollectionDto.slug}" already exists`
        );
      }

      const collection = this.collectionsRepository.create(createCollectionDto);
      const savedCollection = await this.collectionsRepository.save(collection);

      this.logger.log(`Collection created: ${savedCollection.id}`);
      return savedCollection;
    } catch (error) {
      this.logger.error(`Failed to create collection: ${error.message}`);
      throw error;
    }
  }

  async findAll(query: PaginationQueryCollectionDto) {
    try {
      const processedQuery = this.processQuery(query);

      const qb = this.collectionsRepository.createQueryBuilder('collection');

      const paginationQuery: PaginationQuery = {
        page: processedQuery.page,
        limit: processedQuery.limit,
        sortBy: processedQuery.sortBy || 'createdAt',
        sortOrder: processedQuery.sortOrder?.toUpperCase() as
          | 'ASC'
          | 'DESC'
          | undefined,
        filters: processedQuery.filters,
      };

      const result = await this.paginationService.paginate(
        qb,
        'collection',
        paginationQuery,
        processedQuery.filters
      );

      return {
        collections: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch collections: ${error.message}`);
      throw error;
    }
  }

  private processQuery(query: PaginationQueryCollectionDto) {
    const parsedFilters = this.filterParserService.parseFilters(query.filters);

    const sanitizedFilters = parsedFilters
      ? this.filterParserService.validateAndSanitizeFilters(parsedFilters)
      : undefined;

    return {
      ...query,
      filters: sanitizedFilters,
      sortOrder: query.sortOrder?.toUpperCase() as 'ASC' | 'DESC' | undefined,
    };
  }

  async findOne(id: string): Promise<Collection> {
    try {
      const collection = await this.collectionsRepository.findOne({
        where: { id },
      });

      if (!collection) {
        throw new NotFoundException(`Collection with ID "${id}" not found`);
      }

      return collection;
    } catch (error) {
      this.logger.error(`Failed to fetch collection ${id}: ${error.message}`);
      throw error;
    }
  }

  async update(
    id: string,
    updateCollectionDto: CollectionsDto
  ): Promise<Collection> {
    try {
      const collection = await this.findOne(id);
      if (
        updateCollectionDto.slug &&
        updateCollectionDto.slug !== collection.slug
      ) {
        const existingCollection = await this.collectionsRepository.findOne({
          where: { slug: updateCollectionDto.slug },
        });

        if (existingCollection) {
          throw new BadRequestException(
            `Collection with slug "${updateCollectionDto.slug}" already exists`
          );
        }
      }

      Object.assign(collection, updateCollectionDto);
      const updatedCollection =
        await this.collectionsRepository.save(collection);

      this.logger.log(`Collection updated: ${id}`);
      return updatedCollection;
    } catch (error) {
      this.logger.error(`Failed to update collection ${id}: ${error.message}`);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const collection = await this.findOne(id);
      await this.collectionsRepository.remove(collection);

      this.logger.log(`Collection deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete collection ${id}: ${error.message}`);
      throw error;
    }
  }

  async findBySlug(slug: string): Promise<Collection> {
    try {
      const collection = await this.collectionsRepository.findOne({
        where: { slug },
      });

      if (!collection) {
        throw new NotFoundException(`Collection with slug "${slug}" not found`);
      }

      return collection;
    } catch (error) {
      this.logger.error(
        `Failed to fetch collection by slug ${slug}: ${error.message}`
      );
      throw error;
    }
  }

  async findActive(): Promise<Collection[]> {
    try {
      return await this.collectionsRepository.find({
        where: { status: CollectionStatus.ACTIVE },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to fetch active collections: ${error.message}`);
      throw error;
    }
  }

  async findOneWithProducts(id: string) {
    try {
      const collection = await this.collectionsRepository
        .createQueryBuilder('collection')
        .leftJoinAndSelect(
          'collection.collectionProducts',
          'collectionProducts'
        )
        .leftJoinAndSelect('collectionProducts.product', 'product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.brand', 'brand')
        .where('collection.id = :id', { id })
        .orderBy('collectionProducts.sortOrder', 'ASC')
        .addOrderBy('collectionProducts.createdAt', 'ASC')
        .getOne();

      if (!collection) {
        throw new NotFoundException(`Collection with ID "${id}" not found`);
      }

      return collection;
    } catch (error) {
      this.logger.error(
        `Failed to fetch collection with products ${id}: ${error.message}`
      );
      throw error;
    }
  }

  async addProducts(collectionId: string, productIds: string[]): Promise<void> {
    try {
      const collection = await this.findOne(collectionId);

      const existingProducts = await this.collectionProductRepository.find({
        where: {
          collectionId,
          productId: In(productIds),
        },
      });

      const existingProductIds = existingProducts.map((ep) => ep.productId);
      const newProductIds = productIds.filter(
        (id) => !existingProductIds.includes(id)
      );

      if (newProductIds.length === 0) {
        throw new BadRequestException(
          'All products are already in this collection'
        );
      }

      const maxSortOrder = await this.collectionProductRepository
        .createQueryBuilder('cp')
        .select('MAX(cp.sortOrder)', 'maxSortOrder')
        .where('cp.collectionId = :collectionId', { collectionId })
        .getRawOne();

      const startSortOrder = (maxSortOrder?.maxSortOrder || 0) + 1;

      const collectionProducts = newProductIds.map((productId, index) => {
        return this.collectionProductRepository.create({
          collectionId,
          productId,
          sortOrder: startSortOrder + index,
          collection: collection,
          product: { id: productId },
        });
      });

      await this.collectionProductRepository.save(collectionProducts);

      const totalProducts = await this.collectionProductRepository.count({
        where: { collectionId },
      });

      await this.collectionsRepository.update(collectionId, {
        productsCount: totalProducts,
      });

      this.logger.log(
        `Added ${newProductIds.length} products to collection ${collectionId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to add products to collection ${collectionId}: ${error.message}`
      );
      throw error;
    }
  }

  async removeProducts(
    collectionId: string,
    productIds: string[]
  ): Promise<void> {
    try {
      await this.collectionProductRepository.delete({
        collectionId,
        productId: In(productIds),
      });

      const totalProducts = await this.collectionProductRepository.count({
        where: { collectionId },
      });

      await this.collectionsRepository.update(collectionId, {
        productsCount: totalProducts,
      });

      this.logger.log(
        `Removed ${productIds.length} products from collection ${collectionId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to remove products from collection ${collectionId}: ${error.message}`
      );
      throw error;
    }
  }

  async updateProductOrder(
    collectionId: string,
    productId: string,
    sortOrder: number
  ): Promise<void> {
    try {
      const collectionProduct = await this.collectionProductRepository.findOne({
        where: { collectionId, productId },
      });

      if (!collectionProduct) {
        throw new NotFoundException(
          `Product ${productId} not found in collection ${collectionId}`
        );
      }

      await this.collectionProductRepository.update(
        { collectionId, productId },
        { sortOrder }
      );

      this.logger.log(
        `Updated product ${productId} order in collection ${collectionId}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to update product order in collection ${collectionId}: ${error.message}`
      );
      throw error;
    }
  }

  async getCollectionProducts(collectionId: string) {
    try {
      const collectionProducts = await this.collectionProductRepository.find({
        where: { collectionId },
        relations: ['product', 'product.category', 'product.brand'],
        order: { sortOrder: 'ASC', createdAt: 'ASC' },
      });

      return collectionProducts;
    } catch (error) {
      this.logger.error(
        `Failed to fetch collection products ${collectionId}: ${error.message}`
      );
      throw error;
    }
  }

  async getCollectionProductsPaginated(
    collectionId: string,
    query: CollectionProductsPaginationDto
  ) {
    try {
      await this.findOne(collectionId);

      const processedQuery = this.processCollectionProductsQuery(query);

      const qb = this.collectionProductRepository
        .createQueryBuilder('collectionProduct')
        .leftJoinAndSelect('collectionProduct.product', 'product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.brand', 'brand')
        .where('collectionProduct.collectionId = :collectionId', {
          collectionId,
        });

      const paginationQuery: PaginationQuery = {
        page: processedQuery.page,
        limit: processedQuery.limit,
        sortBy: processedQuery.sortBy || 'collectionProduct.sortOrder',
        sortOrder: processedQuery.sortOrder?.toUpperCase() as
          | 'ASC'
          | 'DESC'
          | undefined,
        filters: processedQuery.filters,
      };

      const result = await this.paginationService.paginate(
        qb,
        'collectionProduct',
        paginationQuery,
        processedQuery.filters
      );

      return {
        products: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch collection products: ${error.message}`
      );
      throw error;
    }
  }

  private processCollectionProductsQuery(
    query: CollectionProductsPaginationDto
  ) {
    const parsedFilters = this.filterParserService.parseFilters(query.filters);

    const sanitizedFilters = parsedFilters
      ? this.filterParserService.validateAndSanitizeFilters(parsedFilters)
      : undefined;

    return {
      ...query,
      filters: sanitizedFilters,
      sortOrder: query.sortOrder?.toUpperCase() as 'ASC' | 'DESC' | undefined,
    };
  }

  async findByStatus(status: string, query: PaginationQueryCollectionDto) {
    const processedQuery = this.processQuery(query);
    const qb = this.collectionsRepository.createQueryBuilder('collection');
    qb.where('collection.status = :status', { status });

    const paginationQuery: PaginationQuery = {
      page: processedQuery.page,
      limit: processedQuery.limit,
      sortBy: processedQuery.sortBy || 'createdAt',
      sortOrder: processedQuery.sortOrder?.toUpperCase() as
        | 'ASC'
        | 'DESC'
        | undefined,
      filters: processedQuery.filters,
    };

    const result = await this.paginationService.paginate(
      qb,
      'collection',
      paginationQuery,
      processedQuery.filters
    );

    return {
      collections: result.data,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }
}
