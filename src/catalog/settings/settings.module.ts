import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilterModule } from '~/filter/filter.module';
import { PaginationModule } from '~/pagination/pagination.module';

import { Product } from '../product/entities/product.entity';
import { SettingsController } from './controller/settings.controller';
import { ProductSetting } from './entity/product-setting.entity';
import { SettingsService } from './service/settings.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductSetting, Product]),
    FilterModule,
    PaginationModule,
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
