import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Category } from '~/catalog/category/entities/category.entity';

import { CreateFamilyDto } from '../dto/create-family.dto';
import { UpdateFamilyDto } from '../dto/update-family.dto';
import { ProductFamily } from '../entity/product-family.entity';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(ProductFamily)
    private productFamilyRepository: Repository<ProductFamily>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
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

  async create(
    createProductFamilyDto: CreateFamilyDto
  ): Promise<ProductFamily> {
    try {
      let category: Category | undefined;

      if (createProductFamilyDto.categoryId) {
        category = await this.findCategoryById(
          createProductFamilyDto.categoryId
        );
      } else {
        this.logger.warn('Category ID not provided');
      }

      const productFamily = this.productFamilyRepository.create({
        ...createProductFamilyDto,
        ...(category && { category }),
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

  async findAll(): Promise<ProductFamily[]> {
    try {
      return await this.productFamilyRepository.find({
        relations: ['category', 'products'],
      });
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

      if (!family) throw new NotFoundException(`Product family not found`);

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
