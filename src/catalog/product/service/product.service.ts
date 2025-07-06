import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';

import { Request } from 'express';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { FilterParserService } from '../../../filter/service/filter-parser.service';
import { FilterService } from '../../../filter/service/filter.service';
import { PaginationQuery } from '../../../pagination/interface/pagination.interface';
import { PaginationService } from '../../../pagination/service/pagination.service';
import { Product } from '../entities/product.entity';
import { CreateProduct } from '../interface/create.interface';
import {
  Pagination,
  ProcessedPagination,
} from '../interface/pagination.interface';

@Injectable({ scope: Scope.REQUEST })
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly filterService: FilterService,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    @Inject(REQUEST) private readonly request: Request
  ) {
    this.ensureUploadsDir();
  }

  async createProducts(
    createProductDto: CreateProduct,
    file?: Express.Multer.File
  ): Promise<Product> {
    let imagePath: string | undefined = undefined;

    if (file) {
      imagePath = await this.saveFileToDisc(file);
    }

    const productData: Partial<Product> = {
      name: createProductDto.name,
      price: createProductDto.price,
      stock: createProductDto.stock,
      description: createProductDto.description,
      image: imagePath,
      sku: createProductDto.sku,
      status: createProductDto.status,
      attributes: createProductDto.attributes,
      comparePrice: createProductDto.comparePrice,
      translations: createProductDto.translations,
      seoTitle: createProductDto.seoTitle,
      seoDescription: createProductDto.seoDescription,
      weight: createProductDto.weight,
      dimensions: createProductDto.dimensions,
    };

    if (createProductDto.familyId) {
      productData.family = { id: createProductDto.familyId } as any;
    }

    productData.category = { id: createProductDto.categoryId } as any;

    const product = this.productRepository.create(productData);

    try {
      const savedProduct = await this.productRepository.save(product);

      const productWithRelations = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: ['category', 'family', 'brand'],
      });

      if (!productWithRelations) {
        throw new Error('Product not found after creation');
      }

      return productWithRelations;
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
      relations: ['category', 'family', 'brand'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateProduct(
    id: number,
    updateDto: Partial<CreateProduct>,
    file?: Express.Multer.File
  ) {
    if (!id) throw new BadRequestException('ID is required');

    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['family', 'category', 'brand'],
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);

    const updateData: Partial<Product> = {
      name: updateDto.name ?? product.name,
      price: updateDto.price ?? product.price,
      stock: updateDto.stock ?? product.stock,
      description: updateDto.description ?? product.description,
    };

    let imagePath = product.image;
    if (file) {
      if (product.image) {
        await this.deleteFile(product.image);
      }

      imagePath = await this.saveFileToDisc(file);
    }

    const updated = this.productRepository.merge(product, {
      ...updateDto,
      image: imagePath,
    });

    const savedProduct = await this.productRepository.save(updated);

    const updatedProduct = await this.productRepository.findOne({
      where: { id: savedProduct.id },
      relations: ['category', 'family', 'brand'],
    });

    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    return updatedProduct;
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }
}
