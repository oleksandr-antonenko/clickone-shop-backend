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

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(ProductFamily)
    private productFamilyRepository: Repository<ProductFamily>,
  ) {}

  async create(createProductFamilyDto: CreateFamilyDto) {
    try {
      const productFamily = this.productFamilyRepository.create(
        createProductFamilyDto,
      );

      return await this.productFamilyRepository.save(productFamily);
    } catch (error) {
      console.error('CreateProductFamily error:', error);
      throw new BadRequestException('Failed to create product family');
    }
  }

  async findAll() {
    return await this.productFamilyRepository.find();
  }

  async findOne(id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const family = await this.productFamilyRepository.findOne({
      where: {
        id,
      },
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
