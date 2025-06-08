import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductFamily } from '../entity/product-family.entity';
import { CreateProductFamilyDto } from '../dto/product-family.dto';

@Injectable()
export class FamiliesService {
  constructor(
    @InjectRepository(ProductFamily)
    private productFamilyRepository: Repository<ProductFamily>,
  ) {}

  async create(createProductFamilyDto: CreateProductFamilyDto) {
    try {
      const productFamily = this.productFamilyRepository.create(
        createProductFamilyDto,
      );
      return await this.productFamilyRepository.save(productFamily);
    } catch (error) {
      throw new BadRequestException('Failed to create product family');
    }
  }

  async findAll() {
    return await this.productFamilyRepository.find();
  }
}
