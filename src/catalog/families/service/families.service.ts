import {
  BadRequestException,
  Body,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductFamily } from '../entity/family.entity';
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
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductFamilyDto: CreateFamilyDto) {
    try {
      let category: Category | null = null;

      if (createProductFamilyDto.categoryId) {
        category = await this.categoryRepository.findOne({
          where: { id: createProductFamilyDto.categoryId },
        });

        if (!category) {
          throw new NotFoundException(
            `Category with ID ${createProductFamilyDto.categoryId} not found`,
          );
        }
      }

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
    return await this.productFamilyRepository.find({ relations: ['category'] });
  }

  async findOne(id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const family = await this.productFamilyRepository.findOne({
      where: {
        id,
      },
      relations: ['category'],
    });

    if (!family) {
      throw new NotFoundException('Product not found');
    }

    return family;
  }

  async update(id: number, @Body() formData: UpdateFamilyDto) {
    const family = await this.productFamilyRepository.findOne({
      where: { id },
    });

    if (!family)
      throw new NotFoundException(`Product family with ID ${id} not found`);

    const updateDto: UpdateFamily = {
      name: formData.name ?? family.name,
      description: formData.description ?? family.description,
      categoryId: formData.categoryId ?? family.category?.id,
    };

    const updated = this.productFamilyRepository.merge(family, {
      ...updateDto,
    });

    return await this.productFamilyRepository.save(updated);
  }

  async remove(id: number) {
    const family = await this.productFamilyRepository.findOne({
      where: { id },
    });

    if (!family)
      throw new NotFoundException(`Product family with ID ${id} not found`);
    await this.productFamilyRepository.delete(id);

    return { message: 'Product deleted successfully' };
  }
}
