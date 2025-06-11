import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductSetting } from '../entity/product-setting.entity';
import { Repository } from 'typeorm';
import { Product } from '~/catalog/product/entities/product.entity';
import { CreateSettingDto } from '../dto/create-setting.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ProductSetting)
    private settingsServiceRepository: Repository<ProductSetting>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}
  private async findProductById(productId?: number): Promise<Product | null> {
    if (!productId) return null;

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException(`Category with ID ${productId} not found`);
    }

    return product;
  }

  async create(createSettingDto: CreateSettingDto) {
    const product = await this.findProductById(createSettingDto.productId);

    const productSetting = this.settingsServiceRepository.create({
      ...createSettingDto,
      product: product ?? undefined,
    });

    try {
      return await this.settingsServiceRepository.save(productSetting);
    } catch (error) {
      console.error('CreateProductFamily error:', error);
      throw new BadRequestException('Failed to create product family');
    }
  }

  async findAll() {
    return await this.settingsServiceRepository.find({
      relations: ['product'],
    });
  }

  async findOne(id: number) {
    if (!id) {
      throw new BadRequestException('ID is required');
    }

    const setting = await this.settingsServiceRepository.findOne({
      where: {
        id,
      },
      relations: ['product'],
    });

    if (!setting) {
      throw new NotFoundException(`Setting with ID ${id} not found`);
    }

    return setting;
  }

  async remove(id: number) {
    const setting = await this.settingsServiceRepository.findOne({
      where: { id },
    });

    if (!setting)
      throw new NotFoundException(`Product setting with ID ${id} not found`);
    await this.settingsServiceRepository.delete(id);

    return { message: 'Product setting deleted successfully' };
  }
}
