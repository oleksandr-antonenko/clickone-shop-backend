import {
  BadRequestException,
  Body,
  Injectable,
  Logger,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductSetting } from '../entity/product-setting.entity';
import { Repository } from 'typeorm';
import { Product } from '~/catalog/product/entities/product.entity';
import { CreateSettingDto } from '../dto/create-setting.dto';
import { UpdateSettingDto } from '../dto/update-setting.dto';
import { UpdateSetting } from '../interface/updateSetting.interface';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ProductSetting)
    private settingsServiceRepository: Repository<ProductSetting>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}
  private readonly logger = new Logger(SettingsService.name);

  private async findProductById(
    productId?: number
  ): Promise<Product | null | undefined> {
    if (!productId) return null;

    try {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      return product;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindProductById error with ID ${productId}: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find product');
    }
  }

  async create(@Body() createSettingDto: CreateSettingDto) {
    try {
      const product = await this.findProductById(createSettingDto.productId);

      const productSetting = this.settingsServiceRepository.create({
        ...createSettingDto,
        product: product ?? undefined,
      });

      return await this.settingsServiceRepository.save(productSetting);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `CreateProductSetting error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to create product setting');
    }
  }

  async findAll() {
    try {
      return await this.settingsServiceRepository.find({
        relations: ['product'],
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindAllProductSettings error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find product settings');
    }
  }

  async findOne(@Param('id') id: number) {
    try {
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
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `FindOneProductSetting error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to find product setting');
    }
  }

  async update(
    @Param('id') id: number,
    @Body() updateSettingDto: UpdateSettingDto
  ) {
    try {
      const setting = await this.settingsServiceRepository.findOne({
        where: { id },
      });

      if (!setting)
        throw new NotFoundException(`Product setting with ID ${id} not found`);

      const product = await this.findProductById(updateSettingDto.productId);

      const updateDto: UpdateSetting = {
        key: updateSettingDto.key ?? setting.key,
        value: updateSettingDto.value ?? setting.value,
      };

      const productSetting = this.settingsServiceRepository.create({
        ...updateDto,
        product: product ?? undefined,
      });

      const updated = this.settingsServiceRepository.merge(setting, {
        ...productSetting,
      });

      return await this.settingsServiceRepository.save(updated);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `UpdateProductSetting error: ${err.message}`,
        err.stack
      );
      throw new BadRequestException('Failed to update product setting');
    }
  }

  async remove(@Param('id') id: number) {
    try {
      const setting = await this.settingsServiceRepository.findOne({
        where: { id },
      });

      if (!setting)
        throw new NotFoundException(`Product setting with ID ${id} not found`);
      await this.settingsServiceRepository.delete(id);

      return { message: 'Product setting deleted successfully' };
    } catch (error) {
      const err = error as Error;
      this.logger.error(`RemoveProductSettingerror: ${err.message}`, err.stack);
      throw new BadRequestException('Failed to delete product setting');
    }
  }
}
