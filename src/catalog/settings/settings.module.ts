import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SettingsController } from './controller/settings.controller';
import { ProductSetting } from './entity/product-setting.entity';
import { SettingsService } from './service/settings.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductSetting])],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
