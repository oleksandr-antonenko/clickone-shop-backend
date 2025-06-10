import { Injectable } from '@nestjs/common';
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
}
