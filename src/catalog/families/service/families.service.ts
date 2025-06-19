import {
  BadRequestException,
  Body,
  Injectable,
  Logger,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { ProductFamily } from '../entity/product-family.entity';
import { CreateFamilyDto } from '../dto/create-family.dto';
import { UpdateFamilyDto } from '../dto/update-family.dto';
import { UpdateFamily } from '../interface/updateFamily.interface';
import { Category } from '~/catalog/category/entities/category.entity';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(ProductFamily)
    private productFamilyRepository: Repository<ProductFamily>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>
  ) {}
  private readonly logger = new Logger(FamiliesService.name);

  private async findCategoryById(
    categoryId?: number
  ): Promise<Category | null | undefined> {
    if (!categoryId) return null;

    try {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      return category;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindCategoryById error with ID ${categoryId}: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find category');
    }
  }

  async create(@Body() createProductFamilyDto: CreateFamilyDto) {
    try {
      const category = await this.findCategoryById(
        createProductFamilyDto.categoryId
      );

      const productFamily = this.productFamilyRepository.create({
        ...createProductFamilyDto,
        category: category ?? undefined,
      });

      return await this.productFamilyRepository.save(productFamily);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `CreateProductFamily error:: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to create product family');
    }
  }

  async findAll() {
    try {
      return await this.productFamilyRepository.find({
        relations: ['category'],
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindAllProductFamilies error:: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find product families');
    }
  }

  async findOne(@Param('id') id: number) {
    try {
      const family = await this.productFamilyRepository.findOne({
        where: {
          id,
        },
        relations: ['category'],
      });

      if (!family) {
        throw new NotFoundException(`Product family with ID ${id} not found`);
      }

      return family;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindOneProductFamily error:: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find product family');
    }
  }

  async update(
    @Param('id') id: number,
    @Body() updateFamilyDto: UpdateFamilyDto
  ) {
    try {
      const family = await this.productFamilyRepository.findOne({
        where: { id },
      });

      if (!family)
        throw new NotFoundException(`Product family with ID ${id} not found`);

      const category = await this.findCategoryById(updateFamilyDto.categoryId);

      const updateDto: UpdateFamily = {
        name: updateFamilyDto.name ?? family.name,
        description: updateFamilyDto.description ?? family.description,
      };

      const productFamily = this.productFamilyRepository.create({
        ...updateDto,
        category: category ?? undefined,
      });

      const updated = this.productFamilyRepository.merge(family, {
        ...productFamily,
      });

      return await this.productFamilyRepository.save(updated);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `UpdateProductFamily error:: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to update product family');
    }
  }

  async remove(@Param('id') id: number) {
    try {
      const family = await this.productFamilyRepository.findOne({
        where: { id },
      });

      if (!family)
        throw new NotFoundException(`Product family with ID ${id} not found`);
      await this.productFamilyRepository.delete(id);

      return { message: 'Product family deleted successfully' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `RemoveProductFamily error:: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to delete product family');
    }
  }
}
