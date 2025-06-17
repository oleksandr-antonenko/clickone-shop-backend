import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
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
  private async findCategoryById(
    categoryId?: number
  ): Promise<Category | null> {
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
      console.error('FindCategoryById error:', error);
      throw new BadRequestException('Failed to find category');
    }
  }

  async create(createProductFamilyDto: CreateFamilyDto) {
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
      console.error('CreateProductFamily error:', error);
      throw new BadRequestException('Failed to create product family');
    }
  }

  async findAll() {
    try {
      return await this.productFamilyRepository.find({
        relations: ['category'],
      });
    } catch (error) {
      console.error('FindAllProductFamilies error:', error);
      throw new BadRequestException('Failed to find product families');
    }
  }

  async findOne(id: number) {
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
      console.error('FindOneProductFamily error:', error);
      throw new BadRequestException('Failed to find product family');
    }
  }

  async update(id: number, @Body() formData: UpdateFamilyDto) {
    try {
      const family = await this.productFamilyRepository.findOne({
        where: { id },
      });

      if (!family)
        throw new NotFoundException(`Product family with ID ${id} not found`);

      const category = await this.findCategoryById(formData.categoryId);

      const updateDto: UpdateFamily = {
        name: formData.name ?? family.name,
        description: formData.description ?? family.description,
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
      console.error('UpdateProductFamily error:', error);
      throw new BadRequestException('Failed to update product family');
    }
  }

  async remove(id: number) {
    try {
      const family = await this.productFamilyRepository.findOne({
        where: { id },
      });

      if (!family)
        throw new NotFoundException(`Product family with ID ${id} not found`);
      await this.productFamilyRepository.delete(id);

      return { message: 'Product family deleted successfully' };
    } catch (error) {
      console.error('RemoveProductFamily error:', error);
      throw new BadRequestException('Failed to delete product family');
    }
  }
}
