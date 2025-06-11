import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductSetting } from '../entity/product-setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(ProductSetting)
    private settingsServiceRepository: Repository<ProductSetting>,
  ) {}

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
}
