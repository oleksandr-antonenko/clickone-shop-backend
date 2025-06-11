import { Module } from '@nestjs/common';
import { SettingsService } from './service/settings.service';
import { SettingsController } from './controller/settings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductSetting } from './entity/product-setting.entity';
import { Product } from '../product/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSetting, Product])],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
