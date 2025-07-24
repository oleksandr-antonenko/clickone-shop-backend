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
import { AttributeOption } from '~/catalog/attributes/entity/attribute-options.entity';
import { Attribute } from '~/catalog/attributes/entity/attribute.entity';
import { Brand } from '~/catalog/brands/entities/brand.entity';
import { Category } from '~/catalog/category/entities/category.entity';
import { ProductFamily } from '~/catalog/families/entity/product-family.entity';

import { FilterParserService } from '../../../filter/service/filter-parser.service';
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
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Attribute)
    private readonly attributeRepository: Repository<Attribute>,
    @InjectRepository(AttributeOption)
    private attributeOptionsRepository: Repository<AttributeOption>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(ProductFamily)
    private readonly familyRepository: Repository<ProductFamily>,
    private readonly filterParserService: FilterParserService,
    private readonly paginationService: PaginationService,
    @Inject(REQUEST) private readonly request: Request
  ) {
    void this.ensureUploadsDir();
  }

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
        const family = await this.familyRepository.findOne({
          where: { id: createProductDto.familyId },
        });
        if (!family) {
          throw new BadRequestException('Family not found');
        }
        productData.family = family;
      }

      const product = this.productRepository.create(productData);
      const savedProduct = await this.productRepository.save(product);

      if (createProductDto.attributes && createProductDto.attributes.length) {
        const attributes = await this.attributeRepository.find({
          where: { id: In(createProductDto.attributes) },
        });

        savedProduct.attributes = attributes;

        const options = await this.attributeOptionsRepository.findBy({
          id: In(createProductDto.selectedOptions || []),
        });

        savedProduct.selectedOptions = options;
        await this.productRepository.save(savedProduct);
      }

      const productWithRelations = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: [
          'category',
          'family',
          'brand',
          'attributes',
          'selectedOptions',
          'selectedOptions.attribute',
        ],
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
      const err = error as Error;
      this.logger.error(
        `FindAllProductFamilies error: ${err.message}`,
        err.stack
      );
      console.warn('Failed to delete file:', filePath);
    }
  }

  async findAll(query: Pagination) {
    try {
      const processedQuery = this.processQuery(query, this.request.query);

      const qb = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.category', 'category')
        .leftJoinAndSelect('product.family', 'family')
        .leftJoinAndSelect('product.brand', 'brand')
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
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      const err = error as Error;
      this.logger.error(`FindAllProducts error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find products');
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

  async findOne(id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }
    const product = await this.productRepository.findOne({
      where: {
        id,
      },
      relations: [
        'category',
        'family',
        'brand',
        'selectedOptions',
        'selectedOptions.attribute',
      ],
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

    const { attributes, selectedOptions, ...restDto } = updateDto;

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

      if (updateDto.familyId) {
        const family = await this.familyRepository.findOneBy({
          id: updateDto.familyId,
        });
        if (!family) throw new NotFoundException('Family not found');
        updated.family = family;
      }

      if (updateDto.categoryId) {
        const category = await this.categoryRepository.findOneBy({
          id: updateDto.categoryId,
        });
        if (!category) throw new NotFoundException('Category not found');
        updated.category = category;
      }

      if (updateDto.brandId) {
        const brand = await this.brandRepository.findOneBy({
          id: updateDto.brandId,
        });
        if (!brand) throw new NotFoundException('Brand not found');
        updated.brand = brand;
      }

      const savedProduct = await this.productRepository.save(updated);

      if (attributes && attributes.length) {
        const attributesArray = await this.attributeRepository.find({
          where: { id: In(attributes) },
        });

        savedProduct.attributes = attributesArray;

        const options = await this.attributeOptionsRepository.findBy({
          id: In(selectedOptions || []),
        });

        savedProduct.selectedOptions = options;
        await this.productRepository.save(savedProduct);
      }

      const updatedProduct = await this.productRepository.findOne({
        where: { id: savedProduct.id },
        relations: [
          'category',
          'family',
          'brand',
          'selectedOptions',
          'selectedOptions.attribute',
        ],
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
