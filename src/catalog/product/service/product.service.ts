import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { promises as fs } from 'fs';
import * as path from 'path';
import { In, Repository } from 'typeorm';
import { Attribute } from '~/catalog/attributes/entity/attribute.entity';
import { Brand } from '~/catalog/brands/entities/brand.entity';
import { Category } from '~/catalog/category/entities/category.entity';

import { FilterParserService } from '../../../filter/service/filter-parser.service';
import { FilterService } from '../../../filter/service/filter.service';
import { PaginationQuery } from '../../../pagination/interface/pagination.interface';
import { PaginationService } from '../../../pagination/service/pagination.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { Product } from '../entities/product.entity';
import {
  Pagination,
  ProcessedPagination,
} from '../interface/pagination.interface';

@Injectable({ scope: Scope.REQUEST })
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly filterService: FilterService,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    @Inject(REQUEST) private readonly request: Request
  ) {
    this.ensureUploadsDir();
  }

  private readonly logger = new Logger(ProductService.name);

  async createProducts(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File
  ): Promise<Product> {
    let imagePath: string | undefined = undefined;
    try {
      if (file) {
        imagePath = await this.saveFileToDisc(file);
      }

      const category = await this.categoryRepository.findOne({
        where: { id: createProductDto.categoryId },
      });
      if (!category) {
        throw new BadRequestException(
          `Category with id=${createProductDto.categoryId} does not exist. Please create the category first.`
        );
      }

      let brand: Brand | undefined = undefined;
      if (createProductDto.brandId) {
        const foundBrand = await this.brandRepository.findOne({
          where: { id: createProductDto.brandId },
        });
        if (!foundBrand) {
          throw new BadRequestException(
            `Brand does not exist. Please create the brand first.`
          );
        }
        brand = foundBrand;
      }

      const productData: Partial<Product> = {
        name: createProductDto.name,
        price: createProductDto.price,
        stock: createProductDto.stock,
        description: createProductDto.description,
        image: imagePath,
        sku: createProductDto.sku,
        status: createProductDto.status,
        comparePrice: createProductDto.comparePrice,
        translations: createProductDto.translations,
        seoTitle: createProductDto.seoTitle,
        seoDescription: createProductDto.seoDescription,
        weight: createProductDto.weight,
        dimensions: createProductDto.dimensions,
        category,
        brand,
      };

      if (createProductDto.familyId) {
        productData.family = { id: createProductDto.familyId } as any;
      }

      const product = this.productRepository.create(productData);
      const savedProduct = await this.productRepository.save(product);

      if (createProductDto.attributes && createProductDto.attributes.length) {
        const attributes = await this.attributeRepository.find({
          where: { id: In(createProductDto.attributes) },
        });

        savedProduct.attributes = attributes;
        await this.productRepository.save(savedProduct);
      }

      const productWithRelations = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['category', 'family', 'brand', 'attributes'],
      });

      return productWithRelations!;
    } catch (error) {
      if (imagePath) {
        await this.deleteFile(imagePath);
      }
      console.error('Error saving product:', error);
      throw error;
    }
  }

  private async saveFileToDisc(file: Express.Multer.File): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'products');
    const fileExtension = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    await fs.writeFile(filePath, file.buffer);

    return path.join('uploads', 'products', fileName);
  }

  private async ensureUploadsDir(): Promise<void> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'products');
    try {
      await fs.mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create uploads directory:', error);
    }
  }

  private async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(process.cwd(), filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.warn('Failed to delete file:', filePath);
    }
  }

  async findAll(query: Pagination) {
    const processedQuery = this.processQuery(query, this.request.query);

    const page = Math.max(Number(processedQuery.page) || 1, 1);
    const limit = Math.min(Number(processedQuery.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.family', 'family')
      .leftJoinAndSelect('product.brand', 'brand');

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
      'product',
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

  async findOne(id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: ['category', 'family', 'brand', 'attributes'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateProduct(
    id: number,
    updateDto: UpdateProductDto,
    file?: Express.Multer.File
  ) {
    if (!id) throw new BadRequestException('ID is required');

    const { attributes, ...restDto } = updateDto;

    try {
      const product = await this.productRepository.findOne({
        where: { id },
        relations: ['family', 'category', 'brand', 'attributes'],
      });
      if (!product) throw new NotFoundException('Product not found');

      let imagePath = product.image;
      if (file) {
        if (product.image) {
          await this.deleteFile(product.image);
        }

        imagePath = await this.saveFileToDisc(file);
      }

      const updated = this.productRepository.merge(product, {
        ...restDto,
        image: imagePath,
      });

      const savedProduct = await this.productRepository.save(updated);

      if (attributes && attributes.length) {
        const attributesArray = await this.attributeRepository.find({
          where: { id: In(attributes) },
        });

        savedProduct.attributes = attributesArray;
        await this.productRepository.save(savedProduct);
      }

      const updatedProduct = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['category', 'family', 'brand'],
      });

      if (!updatedProduct) {
        throw new NotFoundException('Product not found after update');
      }

      return updatedProduct;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`UpdateProduct error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to update product');
    }
  }

  async remove(id: number) {
    try {
      const product = await this.productRepository.findOne({ where: { id } });
      if (!product) throw new NotFoundException('Product not found');
      await this.productRepository.delete(id);

      return { message: 'Product deleted successfully' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`RemoveProduct error: ${err.message}`, err.stack);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException('Failed to delete product');
    }
  }
}
