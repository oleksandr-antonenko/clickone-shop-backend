import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateBrandDto } from '../dto/create-brand.dto';
import { UpdateBrandDto } from '../dto/update-brand.dto';
import { Brand } from '../entities/brand.entity';

@Injectable()
export class BrandService {
  constructor(
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>
  ) {}

  private readonly logger = new Logger(BrandService.name);

  async create(createBrandDto: CreateBrandDto): Promise<Brand> {
    try {
      const newBrand = this.brandRepository.create(createBrandDto);

      return await this.brandRepository.save(newBrand);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`CreateBrand error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to create brand');
    }
  }

  async findAll(): Promise<Brand[]> {
    try {
      return await this.brandRepository.find({});
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindAllBrands error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find brands');
    }
  }

  async findOne(id: number): Promise<Brand> {
    try {
      const brand = await this.brandRepository.findOne({
        where: {
          id,
        },
        relations: [],
      });

      if (!brand) {
        throw new NotFoundException(`Brand with ID ${id} not found`);
      }

      return brand;
    } catch (error) {
      const err = error as Error;
      this.logger.error(`FindOneBrand error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to find brand');
    }
  }

  async update(id: number, updateBrandDto: UpdateBrandDto): Promise<Brand> {
    try {
      const existingBrand = await this.brandRepository.findOne({
        where: { id },
      });

      if (!existingBrand)
        throw new NotFoundException(`Brand with ID ${id} not found`);

      const updated = this.brandRepository.merge(existingBrand, updateBrandDto);

      return await this.brandRepository.save(updated);
    } catch (error) {
      const err = error as Error;
      this.logger.error(`UpdateBrand error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to update brand');
    }
  }

  async remove(id: number): Promise<{
    message: string;
  }> {
    try {
      const brand = await this.brandRepository.findOne({
        where: { id },
      });

      if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);

      await this.brandRepository.remove(brand);

      return { message: 'Brand deleted successfully' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`RemoveBrand error: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to delete brand');
    }
  }
}
