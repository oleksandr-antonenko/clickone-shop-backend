import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FastifyRequest } from 'fastify';
import { promises as fs } from 'fs';
import * as path from 'path';
import { Repository } from 'typeorm';

import { Product } from '../entities/product.entity';
import { CreateProduct } from '../interface/create.interface';
import { Pagination } from '../interface/pagination.interface';
import { UpdateProduct } from '../interface/updateProduct.interface';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  ) {
    this.ensureUploadsDir();
  }

  async createProductFromRequest(req: FastifyRequest): Promise<Product> {
    const { formData, file } = await this.parseMultipartRequest(req);

    const createInput = this.transformFormDataToDto(formData);

    return this.createProducts(createInput, file);
  }

  private async parseMultipartRequest(req: FastifyRequest): Promise<{
    formData: Record<string, any>;
    file?: any;
  }> {
    const formData: Record<string, any> = {};
    let file: any = null;

    for await (const part of (req as any).parts()) {
      if (part.type === 'field') {
        formData[part.fieldname] = part.value;
      } else if (part.type === 'file') {
        file = part;
      }
    }

    return { formData, file };
  }

  private transformFormDataToDto(formData: Record<string, any>): CreateProduct {
    return {
      name: formData.name,
      price: parseFloat(formData.price),
      stock: formData.stock === 'true',
      description: formData.description,
      familyId: formData.familyId ? parseInt(formData.familyId) : undefined,
    };
  }

  async createProducts(createProductDto: CreateProduct, file?: any) {
    let imagePath: string | undefined = undefined;

    if (file) {
      imagePath = await this.saveFileToDisc(file);
    }

    const productData = {
      ...createProductDto,
      image: imagePath,
    };

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

  private async saveFileToDisc(file: any): Promise<string> {
    const uploadsDir = path.join(process.cwd(), 'uploads', 'products');
    const fileExtension = path.extname(file.filename);
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    const buffer = await file.toBuffer();
    await fs.writeFile(filePath, buffer);

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
    const page = parseInt(String(query.page || '1')) || 1;
    const limit = parseInt(String(query.limit || '10')) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await this.productRepository.findAndCount({
      skip,
      take: limit,
      relations: ['settings'],
      order:{
        id: 'ASC',
      },
    });

    return {
      products,
      total,
      page,
      limit,
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
      relations: ['settings']
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async updateProduct(id: number, req: FastifyRequest) {
    if (!id) throw new BadRequestException('ID is required');

    const { formData, file } = await this.parseMultipartRequest(req);

    const product = await this.productRepository.findOne({ where: { id } });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);

    const updateDto: UpdateProduct = {
      name: formData.name ?? product.name,
      price: formData.price ? parseFloat(formData.price) : product.price,
      stock: formData.stock ? formData.stock === 'true' : product.stock,
      description: formData.description ?? product.description,
      familyId: formData.familyId ? parseInt(formData.familyId) : undefined,
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
