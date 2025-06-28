import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { promises as fs } from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { FilterService } from '../../../filter/service/filter.service';
import { FilterParserService } from '../../../filter/service/filter-parser.service';
import { Product } from '../entities/product.entity';
import { CreateProduct } from '../interface/create.interface';
import { Pagination, ProcessedPagination } from '../interface/pagination.interface';
import { UpdateProduct } from '../interface/updateProduct.interface';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly filterService: FilterService,
    private readonly filterParserService: FilterParserService
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
    };

    if (createProductDto.familyId) {
      productData.family = { id: createProductDto.familyId } as any;
    }

    const product = this.productRepository.create(productData);

    try {
      const savedProduct = await this.productRepository.save(product);
      return savedProduct;
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

  async findAll(query: Pagination, rawQuery?: Record<string, any>) {
    const processedQuery = this.processQuery(query, rawQuery);

    const page = Math.max(Number(processedQuery.page) || 1, 1);
    const limit = Math.min(Number(processedQuery.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const qb = this.productRepository.createQueryBuilder('product');

    if (processedQuery.filters) {
      this.filterService.applyFilters(qb, 'product', processedQuery.filters);
    }

    const sortBy = processedQuery.sortBy || 'id';
    const sortOrder = (processedQuery.sortOrder || 'ASC').toUpperCase() as
      | 'ASC'
      | 'DESC';
    qb.orderBy(`product.${sortBy}`, sortOrder);

    qb.skip(skip).take(limit);

    const [products, total] = await qb.getManyAndCount();

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
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
      relations: ['family'],
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
    return await this.productRepository.save(updated);
  }

  async remove(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    await this.productRepository.delete(id);
    return { message: 'Product deleted successfully' };
  }
}
